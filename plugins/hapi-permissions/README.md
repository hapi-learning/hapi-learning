# Hapi-permissions

Hapi plugin to handle permissions for the 4 standard method (Create, Read, Update, Delete)
on resources.

## Configuration

Hapi-permissions is a per-route configuration.

#### Example

```
server.route({
    method: 'GET',
    path: '/resourceA',
    plugins: {
        permissions: {
            resourceName: 'resourceA',
            acl: ['C', 'R'] // Create and read only
        }
    },
    config: {
        handler: function(request, reply) { ... }
    }
});

```
