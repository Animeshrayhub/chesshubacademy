import { useEffect } from 'react';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';

const schemas = {
    organization: () => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ChessHub Academy',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'Online chess academy offering personalized coaching for all skill levels.',
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Hindi'],
        },
    }),

    course: (course) => ({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.name,
        description: course.description,
        provider: {
            '@type': 'Organization',
            name: 'ChessHub Academy',
            url: SITE_URL,
        },
        courseMode: 'online',
        educationalLevel: course.level || 'beginner',
        ...(course.price && {
            offers: {
                '@type': 'Offer',
                price: course.price,
                priceCurrency: 'INR',
            },
        }),
    }),

    blogPosting: (post) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.meta_description || '',
        image: post.featured_image || '',
        url: `${SITE_URL}/blog/${post.slug}`,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
            '@type': 'Organization',
            name: 'ChessHub Academy',
        },
        publisher: {
            '@type': 'Organization',
            name: 'ChessHub Academy',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
    }),

    product: (ebook) => ({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: ebook.title,
        description: ebook.description,
        image: ebook.cover_image || '',
        offers: {
            '@type': 'Offer',
            price: ebook.is_free ? '0' : ebook.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        },
    }),
};

function injectJsonLd(id, data) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

export function useOrganizationSchema() {
    useEffect(() => {
        injectJsonLd('schema-organization', schemas.organization());
        return () => removeJsonLd('schema-organization');
    }, []);
}

export function useCourseSchema(course) {
    useEffect(() => {
        if (!course) return;
        const id = `schema-course-${course.id || course.name}`;
        injectJsonLd(id, schemas.course(course));
        return () => removeJsonLd(id);
    }, [course]);
}

export function useBlogPostingSchema(post) {
    useEffect(() => {
        if (!post) return;
        injectJsonLd('schema-blogposting', schemas.blogPosting(post));
        return () => removeJsonLd('schema-blogposting');
    }, [post]);
}

export function useProductSchema(product) {
    useEffect(() => {
        if (!product) return;
        const id = `schema-product-${product.id || product.title}`;
        injectJsonLd(id, schemas.product(product));
        return () => removeJsonLd(id);
    }, [product]);
}

export function useMultipleCourseSchemas(courses) {
    useEffect(() => {
        if (!courses || courses.length === 0) return;
        const ids = courses.map((c, i) => {
            const id = `schema-course-${i}`;
            injectJsonLd(id, schemas.course(c));
            return id;
        });
        return () => ids.forEach(removeJsonLd);
    }, [courses]);
}

export default { useOrganizationSchema, useCourseSchema, useBlogPostingSchema, useProductSchema, useMultipleCourseSchemas };
