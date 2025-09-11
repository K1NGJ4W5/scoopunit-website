/**
 * Advanced Schema Markup for Scoop Unit Dog Waste Removal
 * Comprehensive structured data for maximum SEO impact
 */

// Main Organization Schema - Add to all pages
const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://scoopunit.com",
    "name": "Scoop Unit",
    "alternateName": "Scoop Unit Dog Waste Removal",
    "description": "Professional dog waste removal services across Florida Panhandle including weekly, bi-weekly, and one-time cleanup options",
    "url": "https://scoopunit.com",
    "logo": "https://scoopunit.com/images/scoop-unit-logo.png",
    "image": [
        "https://scoopunit.com/images/scoop-unit-hero.jpg",
        "https://scoopunit.com/images/dog-waste-removal-service.jpg",
        "https://scoopunit.com/images/florida-panhandle-service.jpg"
    ],
    "telephone": "+1-850-555-7667",
    "email": "hello@scoopunit.com",
    "foundingDate": "2024",
    "slogan": "Professional dog waste removal services you can trust",
    
    // Business Hours
    "openingHours": [
        "Mo-Sa 08:00-18:00"
    ],
    
    // Service Areas
    "areaServed": [
        {
            "@type": "City",
            "name": "Crestview",
            "addressRegion": "FL"
        },
        {
            "@type": "City", 
            "name": "Destin",
            "addressRegion": "FL"
        },
        {
            "@type": "City",
            "name": "Pensacola", 
            "addressRegion": "FL"
        },
        {
            "@type": "City",
            "name": "Niceville",
            "addressRegion": "FL"
        },
        {
            "@type": "City",
            "name": "Fort Walton Beach",
            "addressRegion": "FL"
        },
        {
            "@type": "City",
            "name": "Navarre",
            "addressRegion": "FL"
        },
        {
            "@type": "City",
            "name": "Gulf Breeze",
            "addressRegion": "FL"
        }
    ],
    
    // Address (Virtual service business)
    "address": {
        "@type": "PostalAddress",
        "addressRegion": "FL",
        "addressCountry": "US"
    },
    
    // Services Offered
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Dog Waste Removal Services",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Weekly Dog Waste Removal",
                    "description": "Professional weekly pooper scooper service for consistent yard cleanliness"
                },
                "priceRange": "$15-45",
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Bi-Weekly Pooper Scooper Service", 
                    "description": "Affordable bi-weekly dog waste cleanup for smaller yards"
                },
                "priceRange": "$20-60",
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "One-Time Dog Waste Cleanup",
                    "description": "Initial yard cleanup and special occasion waste removal"
                },
                "priceRange": "$30-100", 
                "availability": "https://schema.org/InStock"
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Commercial & HOA Pet Waste Removal",
                    "description": "Professional pet waste management for businesses and communities"
                },
                "priceRange": "$$$",
                "availability": "https://schema.org/InStock"
            }
        ]
    },
    
    // Payment Methods
    "paymentAccepted": [
        "Credit Card", 
        "ACH",
        "Bank Transfer",
        "Apple Pay",
        "Google Pay"
    ],
    "currenciesAccepted": "USD",
    "priceRange": "$$",
    
    // Social Media & Online Presence
    "sameAs": [
        "https://www.facebook.com/scoopunitfl",
        "https://www.instagram.com/scoopunit", 
        "https://www.linkedin.com/company/scoopunit"
    ],
    
    // Business Features
    "amenityFeature": [
        {
            "@type": "LocationFeatureSpecification",
            "name": "Automated Billing",
            "value": true
        },
        {
            "@type": "LocationFeatureSpecification", 
            "name": "Mobile App Access",
            "value": true
        },
        {
            "@type": "LocationFeatureSpecification",
            "name": "Route Optimization",
            "value": true
        }
    ],
    
    // Reviews Aggregate (Update with real data)
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
    }
};

// Service Schema for specific service pages
const serviceSchemas = {
    weekly: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Weekly Dog Waste Removal Service",
        "description": "Professional weekly pooper scooper service providing consistent yard cleanliness and family safety",
        "provider": {
            "@type": "LocalBusiness",
            "@id": "https://scoopunit.com"
        },
        "serviceType": "Pet Waste Removal",
        "category": "Weekly Recurring Service",
        "offers": {
            "@type": "Offer",
            "priceRange": "$15-45",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        "serviceArea": {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "30.4518",
                "longitude": "-86.5149"
            },
            "geoRadius": "50 miles"
        }
    },
    
    biweekly: {
        "@context": "https://schema.org", 
        "@type": "Service",
        "name": "Bi-Weekly Pooper Scooper Service",
        "description": "Budget-friendly bi-weekly dog waste cleanup for smaller yards and fewer pets",
        "provider": {
            "@type": "LocalBusiness",
            "@id": "https://scoopunit.com"
        },
        "serviceType": "Pet Waste Removal",
        "category": "Bi-Weekly Recurring Service"
    },
    
    onetime: {
        "@context": "https://schema.org",
        "@type": "Service", 
        "name": "One-Time Dog Waste Cleanup",
        "description": "Initial yard cleanup, move-in preparation, and special event waste removal",
        "provider": {
            "@type": "LocalBusiness",
            "@id": "https://scoopunit.com"
        },
        "serviceType": "Pet Waste Removal",
        "category": "One-Time Service"
    },
    
    commercial: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Commercial & HOA Pet Waste Removal", 
        "description": "Professional pet waste management for businesses, HOAs, and apartment complexes",
        "provider": {
            "@type": "LocalBusiness",
            "@id": "https://scoopunit.com"
        },
        "serviceType": "Commercial Pet Waste Management",
        "category": "Commercial Service"
    }
};

// City-specific Local Business Schema
const citySchemas = {
    crestview: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://scoopunit.com/crestview",
        "name": "Scoop Unit - Crestview Dog Waste Removal",
        "description": "Professional dog waste removal services in Crestview, Florida",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Crestview",
            "addressRegion": "FL",
            "postalCode": "32536",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "30.7621",
            "longitude": "-86.5705"
        },
        "areaServed": {
            "@type": "City",
            "name": "Crestview",
            "addressRegion": "FL"
        }
    },
    
    destin: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://scoopunit.com/destin", 
        "name": "Scoop Unit - Destin Dog Waste Removal",
        "description": "Professional dog waste removal services in Destin, Florida including vacation rental cleaning",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Destin",
            "addressRegion": "FL", 
            "postalCode": "32541",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "30.3935",
            "longitude": "-86.4958"
        },
        "areaServed": {
            "@type": "City",
            "name": "Destin", 
            "addressRegion": "FL"
        }
    }
    // Add other cities as needed
};

// FAQ Schema for rich snippets
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is a pooper scooper service?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A pooper scooper service is a professional dog waste removal company that comes to your home or property to clean up dog poop on a recurring schedule (weekly, bi-weekly, or one-time). At Scoop Unit, we keep your yard clean, safe, and family-friendly so you don't have to handle the mess."
            }
        },
        {
            "@type": "Question",
            "name": "How much does Scoop Unit cost?",
            "acceptedAnswer": {
                "@type": "Answer", 
                "text": "Pricing depends on the number of dogs, yard size, and service frequency. We offer affordable weekly ($15-45), bi-weekly ($20-60), and one-time cleanup options ($30-100). Get a personalized quote instantly with our Free Estimate Tool."
            }
        },
        {
            "@type": "Question",
            "name": "What areas do you service?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We proudly serve Crestview, Destin, Pensacola, Niceville, Fort Walton Beach, Navarre, Gulf Breeze, and surrounding Florida Panhandle communities."
            }
        },
        {
            "@type": "Question",
            "name": "Is pet waste dangerous?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes — dog waste can contain harmful bacteria and parasites that pose risks to kids, pets, and lawns. Regular cleanup keeps your family safe and your yard healthy."
            }
        },
        {
            "@type": "Question",
            "name": "How often should you remove dog waste?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "For optimal health and safety, weekly dog waste removal is recommended for most families. This prevents buildup, reduces health risks, and maintains a consistently clean yard environment."
            }
        }
    ]
};

// Review Schema (Add real reviews)
const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
        "@type": "LocalBusiness",
        "@id": "https://scoopunit.com"
    },
    "author": {
        "@type": "Person",
        "name": "Sarah M."
    },
    "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
    },
    "reviewBody": "Finally found a reliable pooper scooper service in Crestview! They show up every week like clockwork. My kids can play in the yard safely again.",
    "datePublished": "2024-01-10"
};

// Article Schema for blog posts
const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "5 Serious Health Risks of Dog Waste in Your Yard",
    "author": {
        "@type": "Organization",
        "name": "Scoop Unit",
        "url": "https://scoopunit.com"
    },
    "publisher": {
        "@type": "Organization", 
        "name": "Scoop Unit",
        "logo": {
            "@type": "ImageObject",
            "url": "https://scoopunit.com/images/scoop-unit-logo.png"
        }
    },
    "datePublished": "2024-01-15",
    "dateModified": "2024-01-15",
    "description": "Discover the hidden dangers lurking in your yard when dog waste isn't properly removed. From E. coli to parasites, learn why professional cleanup matters for family safety.",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://scoopunit.com/blog.html#health-risks"
    },
    "image": "https://scoopunit.com/images/dog-waste-health-risks.jpg"
};

// Function to inject schema into page
function injectSchema(schemaObject, id = null) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaObject);
    if (id) script.id = id;
    document.head.appendChild(script);
}

// Auto-inject appropriate schemas based on page
document.addEventListener('DOMContentLoaded', function() {
    // Always inject organization schema
    injectSchema(organizationSchema, 'organization-schema');
    
    // Inject page-specific schemas
    const path = window.location.pathname;
    
    if (path.includes('crestview')) {
        injectSchema(citySchemas.crestview, 'city-schema');
    } else if (path.includes('destin')) {
        injectSchema(citySchemas.destin, 'city-schema');
    } else if (path.includes('weekly-dog-poop-removal')) {
        injectSchema(serviceSchemas.weekly, 'service-schema');
    } else if (path.includes('faq')) {
        injectSchema(faqSchema, 'faq-schema');
    } else if (path.includes('blog')) {
        injectSchema(articleSchema, 'article-schema');
    }
});

// Export for manual injection if needed
window.ScoopUnitSchemas = {
    organization: organizationSchema,
    services: serviceSchemas,
    cities: citySchemas,
    faq: faqSchema,
    review: reviewSchema,
    article: articleSchema,
    inject: injectSchema
};