// src/domains/blog/utils/blog-cache-keys.ts

/**
 * Κλειδιά cache για το blog domain.
 * Αυτό το αρχείο περιέχει τις συναρτήσεις δημιουργίας των κλειδιών cache
 * για διάφορες λειτουργίες του blog. Κεντρικοποιώντας τα κλειδιά, 
 * αποφεύγουμε λάθη στην ονομασία και διευκολύνουμε τη συντήρηση.
 */
export const blogCacheKeys = {
    posts: {
      /**
       * Κλειδί για όλα τα blog posts με συγκεκριμένο pagination.
       */
      all: (page: number, limit: number) => 
        `blogs:all:page:${page}:limit:${limit}`,
      
      /**
       * Κλειδί για blog posts μιας συγκεκριμένης κατηγορίας.
       */
      byCategory: (category: string, page: number, limit: number) => 
        `blogs:category:${category}:page:${page}:limit:${limit}`,
      
      /**
       * Κλειδί για αποτελέσματα αναζήτησης blog posts.
       */
      search: (query: string, limit: number) => 
        `blogs:search:${query}:limit:${limit}`,
      
      /**
       * Κλειδί για ένα συγκεκριμένο blog post με βάση το slug.
       */
      bySlug: (slug: string) => 
        `blog:slug:${slug}`,
      
      /**
       * Κλειδί για σχετικά blog posts ενός συγκεκριμένου post.
       */
      related: (slug: string, limit: number) => 
        `blog:related:${slug}:limit:${limit}`,
    }
  };