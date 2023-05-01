# Libraries Used

## Dexie

[Dexie](https://dexie.org/) is an [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) wrapper. It is the base of all data storage in the Avocado Manager tooling.

**Accessing the source:**

1. Go to the Dexie documentation
2. Select the vanilla JavaScript version
3. A "Hello World" code snippet is presented
4. Copy the URL used in the `script` tag ([link](https://unpkg.com/dexie/dist/dexie.js))
5. Paste the URL into the browser location bar to view the source
6. Save the source code to `lib` as `dexie-VERSION.js`
7. Update the `index.html` page to point to the new version

## UUIDv4

Data records often need unique identifiers, for which a common solution is [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) generation. There are many UUID JavaScript libraries, but Taste Buddy requires support for [ECMAScript Modules](https://hospodarets.com/native-ecmascript-modules-the-first-overview) (ESM). ESM is the JavaScript-native solution to modules.

1. Visit the [CDN Builds](https://github.com/uuidjs/uuid#cdn-builds) section of the GitHub repository for the library
2. Copy the URL used in the `import/from` statement ([link](https://jspm.dev/uuid))
3. Paste the URL into the browser location bar to view the source
4. This is another import
    - Copy the URL within the quotes
    - This is currently `/npm:uuid@9.0.0`
    - Place this as the URL off the root directory of the domain ([link](https://jspm.dev/npm:uuid@9.0.0))
5. Save the source code to `lib` as `uuid-VERSION.js`
