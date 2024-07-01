// You may edit this file, add new files to support this file,
// and/or add new dependencies to the project as you see fit.
// However, you must not change the surface API presented from this file,
// and you should not need to change any other files in the project to complete the challenge

export const defaultCache = {
  data: null,
  error: null,
  isLoading: true,
}

export interface Results {
  isLoading: boolean;
  data: unknown;
  error: Error | null;
}

type UseCachingFetch = (url: string) => Results;

type Cache = {
  [url: string]: Results;
};

let cache: Cache = {};

/**
 * 1. Implement a caching fetch hook. The hook should return an object with the following properties:
 * - isLoading: a boolean that is true when the fetch is in progress and false otherwise
 * - data: the data returned from the fetch, or null if the fetch has not completed
 * - error: an error object if the fetch fails, or null if the fetch is successful
 *
 * This hook is called three times on the client:
 *  - 1 in App.tsx
 *  - 2 in Person.tsx
 *  - 3 in Name.tsx
 *
 * Acceptance Criteria:
 * 1. The application at /appWithoutSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should only see 1 network request in the browser's network tab when visiting the /appWithoutSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const useCachingFetch: UseCachingFetch = (url) => {
  if(!url){
    throw new Error(
      'Fetch API not defined',
    );
  }

  if (!cache[url]) {
    cache[url] = defaultCache;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        cache[url].data = data;
        cache[url].isLoading = false;

        return {
          data: data,
          isLoading: false,
          error: null,
        }
      })
      .catch((error) => {
        cache[url].error = error;
        cache[url].isLoading = false;

        return defaultCache;
      });
  }

  return {
    data: cache[url].data,
    isLoading: cache[url].isLoading,
    error: cache[url].error,
  };
};

/**
 * 2. Implement a preloading caching fetch function. The function should fetch the data.
 *
 * This function will be called once on the server before any rendering occurs.
 *
 * Any subsequent call to useCachingFetch should result in the returned data being available immediately.
 * Meaning that the page should be completely serverside rendered on /appWithSSRData
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript disabled, you should see a list of people.
 * 2. You have not changed any code outside of this file to achieve this.
 * 3. This file passes a type-check.
 *
 */
export const preloadCachingFetch = async (url: string): Promise<void> => {
  if(!url){
    throw new Error(
      'Fetch API not defined',
    );
  }

  if (!cache[url]) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      cache[url] = {
        data,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      cache[url] = {
        data: null,
        error,
        isLoading: false,
      };
    }
  }
};

/**
 * 3.1 Implement a serializeCache function that serializes the cache to a string.
 * 3.2 Implement an initializeCache function that initializes the cache from a serialized cache string.
 *
 * Together, these two functions will help the framework transfer your cache to the browser.
 *
 * The framework will call `serializeCache` on the server to serialize the cache to a string and inject it into the dom.
 * The framework will then call `initializeCache` on the browser with the serialized cache string to initialize the cache.
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should not see any network calls to the people API when visiting the /appWithSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const serializeCache = (): string => {
  return JSON.stringify(cache);
};

export const initializeCache = (serializedCache: string): void => {
  cache = JSON.parse(serializedCache);
};

export const wipeCache = (): void => {
  cache = {};
};
