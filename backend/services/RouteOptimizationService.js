const axios = require('axios');
const { Client, Job, Route, FieldTechnician } = require('../models');

class RouteOptimizationService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.optimizationApiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  }

  // Main route optimization function
  async optimizeRoute(fieldTechId, date, jobs = null) {
    try {
      // Get field tech location
      const fieldTech = await FieldTechnician.findById(fieldTechId);
      if (!fieldTech) {
        throw new Error('Field technician not found');
      }

      // Get jobs for the day if not provided
      if (!jobs) {
        jobs = await Job.getByFieldTechAndDate(fieldTechId, date);
      }

      if (jobs.length === 0) {
        return { optimizedRoute: [], totalDistance: 0, estimatedDuration: 0 };
      }

      // Get client locations for all jobs
      const jobsWithLocations = await this.getJobsWithLocations(jobs);

      // Create distance matrix
      const distanceMatrix = await this.createDistanceMatrix(jobsWithLocations, fieldTech.current_location);

      // Optimize using traveling salesman algorithm
      const optimizedOrder = await this.solveTSP(distanceMatrix, jobsWithLocations);

      // Calculate total distance and duration
      const routeMetrics = this.calculateRouteMetrics(optimizedOrder, distanceMatrix);

      // Save optimized route
      const savedRoute = await this.saveOptimizedRoute(fieldTechId, date, optimizedOrder, routeMetrics);

      return {
        optimizedRoute: optimizedOrder,
        totalDistance: routeMetrics.totalDistance,
        estimatedDuration: routeMetrics.estimatedDuration,
        routeId: savedRoute.id
      };

    } catch (error) {
      console.error('Route optimization error:', error);
      throw error;
    }
  }

  async getJobsWithLocations(jobs) {
    const jobsWithLocations = [];
    
    for (const job of jobs) {
      const client = await Client.findById(job.client_id);
      if (client && client.location) {
        jobsWithLocations.push({
          ...job,
          location: client.location,
          address: {
            line1: client.address_line1,
            line2: client.address_line2,
            city: client.city,
            state: client.state,
            zipCode: client.zip_code
          },
          estimatedDuration: job.estimated_duration || 30, // Default 30 minutes
          priority: job.job_type === 'emergency' ? 1 : (job.job_type === 'initial' ? 2 : 3)
        });
      }
    }

    return jobsWithLocations;
  }

  async createDistanceMatrix(jobs, startLocation) {
    const locations = [startLocation, ...jobs.map(job => job.location)];
    const distanceMatrix = [];

    // Initialize matrix
    for (let i = 0; i < locations.length; i++) {
      distanceMatrix[i] = new Array(locations.length).fill(0);
    }

    // Calculate distances using Google Maps Distance Matrix API
    const batchSize = 10; // Google Maps API limit
    for (let i = 0; i < locations.length; i += batchSize) {
      for (let j = 0; j < locations.length; j += batchSize) {
        const origins = locations.slice(i, Math.min(i + batchSize, locations.length));
        const destinations = locations.slice(j, Math.min(j + batchSize, locations.length));
        
        const response = await this.getDistanceMatrix(origins, destinations);
        
        // Fill in the matrix
        for (let oi = 0; oi < origins.length; oi++) {
          for (let di = 0; di < destinations.length; di++) {
            const element = response.rows[oi].elements[di];
            if (element.status === 'OK') {
              distanceMatrix[i + oi][j + di] = {
                distance: element.distance.value, // meters
                duration: element.duration.value  // seconds
              };
            }
          }
        }
      }
    }

    return distanceMatrix;
  }

  async getDistanceMatrix(origins, destinations) {
    try {
      const originsStr = origins.map(loc => `${loc.lat},${loc.lng}`).join('|');
      const destinationsStr = destinations.map(loc => `${loc.lat},${loc.lng}`).join('|');
      
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json`, {
          params: {
            origins: originsStr,
            destinations: destinationsStr,
            units: 'metric',
            mode: 'driving',
            traffic_model: 'best_guess',
            departure_time: 'now',
            key: this.googleMapsApiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      throw error;
    }
  }

  // Traveling Salesman Problem solver using nearest neighbor heuristic
  async solveTSP(distanceMatrix, jobs) {
    if (jobs.length <= 1) return jobs;

    const unvisited = new Set(jobs.map((_, index) => index + 1)); // +1 because 0 is start location
    const route = [];
    let currentLocation = 0; // Start from field tech location

    // Handle priority jobs first (emergency, then initial)
    const priorityJobs = jobs
      .map((job, index) => ({ job, index: index + 1 }))
      .filter(item => item.job.priority <= 2)
      .sort((a, b) => a.job.priority - b.job.priority);

    for (const priorityJob of priorityJobs) {
      if (unvisited.has(priorityJob.index)) {
        route.push(jobs[priorityJob.index - 1]);
        unvisited.delete(priorityJob.index);
        currentLocation = priorityJob.index;
      }
    }

    // Process remaining jobs using nearest neighbor
    while (unvisited.size > 0) {
      let nearestDistance = Infinity;
      let nearestJob = null;
      let nearestIndex = null;

      for (const jobIndex of unvisited) {
        const distance = distanceMatrix[currentLocation][jobIndex].distance;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestJob = jobs[jobIndex - 1];
          nearestIndex = jobIndex;
        }
      }

      if (nearestJob) {
        route.push(nearestJob);
        unvisited.delete(nearestIndex);
        currentLocation = nearestIndex;
      }
    }

    return route;
  }

  calculateRouteMetrics(optimizedRoute, distanceMatrix) {
    let totalDistance = 0;
    let estimatedDuration = 0;
    let currentIndex = 0; // Start from field tech location

    for (let i = 0; i < optimizedRoute.length; i++) {
      const jobIndex = i + 1; // Jobs start from index 1 in matrix
      const leg = distanceMatrix[currentIndex][jobIndex];
      
      totalDistance += leg.distance;
      estimatedDuration += leg.duration;
      estimatedDuration += (optimizedRoute[i].estimatedDuration || 30) * 60; // Add job duration in seconds
      
      currentIndex = jobIndex;
    }

    return {
      totalDistance: Math.round(totalDistance * 0.000621371), // Convert meters to miles
      estimatedDuration: Math.round(estimatedDuration / 60) // Convert seconds to minutes
    };
  }

  async saveOptimizedRoute(fieldTechId, date, optimizedRoute, metrics) {
    try {
      const routeData = {
        field_tech_id: fieldTechId,
        route_date: date,
        optimized_order: optimizedRoute.map(job => job.id),
        total_distance: metrics.totalDistance,
        estimated_duration: metrics.estimatedDuration,
        status: 'planned'
      };

      const route = await Route.create(routeData);
      return route;
    } catch (error) {
      console.error('Error saving optimized route:', error);
      throw error;
    }
  }

  // Re-optimize existing route (when jobs are added/removed)
  async reoptimizeRoute(routeId) {
    try {
      const route = await Route.findById(routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      // Get current jobs for the route
      const jobs = await Job.getByIds(route.optimized_order);
      
      // Re-optimize with current jobs
      const optimized = await this.optimizeRoute(route.field_tech_id, route.route_date, jobs);
      
      // Update existing route
      await Route.update(routeId, {
        optimized_order: optimized.optimizedRoute.map(job => job.id),
        total_distance: optimized.totalDistance,
        estimated_duration: optimized.estimatedDuration,
        updated_at: new Date()
      });

      return optimized;
    } catch (error) {
      console.error('Error re-optimizing route:', error);
      throw error;
    }
  }

  // Get navigation directions for next job
  async getNavigationToNextJob(fieldTechId, currentJobId = null) {
    try {
      const fieldTech = await FieldTechnician.findById(fieldTechId);
      const today = new Date().toISOString().split('T')[0];
      const route = await Route.getByFieldTechAndDate(fieldTechId, today);

      if (!route || !route.optimized_order.length) {
        return null;
      }

      let nextJobIndex = 0;
      if (currentJobId) {
        const currentIndex = route.optimized_order.indexOf(currentJobId);
        nextJobIndex = currentIndex + 1;
      }

      if (nextJobIndex >= route.optimized_order.length) {
        return null; // No more jobs
      }

      const nextJobId = route.optimized_order[nextJobIndex];
      const nextJob = await Job.findById(nextJobId);
      const client = await Client.findById(nextJob.client_id);

      // Get directions from current location to next job
      const directions = await this.getDirections(
        fieldTech.current_location,
        client.location
      );

      return {
        job: nextJob,
        client: client,
        directions: directions,
        estimatedArrival: this.calculateEstimatedArrival(directions.duration)
      };

    } catch (error) {
      console.error('Error getting navigation to next job:', error);
      throw error;
    }
  }

  async getDirections(origin, destination) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json', {
          params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            mode: 'driving',
            traffic_model: 'best_guess',
            departure_time: 'now',
            key: this.googleMapsApiKey
          }
        }
      );

      const route = response.data.routes[0];
      return {
        distance: route.legs[0].distance,
        duration: route.legs[0].duration,
        steps: route.legs[0].steps,
        polyline: route.overview_polyline.points
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  calculateEstimatedArrival(durationValue) {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + (durationValue * 1000));
    return arrivalTime;
  }

  // Batch optimize multiple field techs
  async batchOptimizeRoutes(date, fieldTechIds = null) {
    try {
      if (!fieldTechIds) {
        fieldTechIds = await FieldTechnician.getActiveIds();
      }

      const optimizationPromises = fieldTechIds.map(techId => 
        this.optimizeRoute(techId, date).catch(error => {
          console.error(`Error optimizing route for tech ${techId}:`, error);
          return null;
        })
      );

      const results = await Promise.all(optimizationPromises);
      
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Error in batch route optimization:', error);
      throw error;
    }
  }
}

module.exports = new RouteOptimizationService();