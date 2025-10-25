// Log all routes on startup
export function logRoutes(stack: any, prefix = '') {
    for (const layer of stack) {
        if (layer.route?.path) {
            // Layer is a route
            const methods = Object.keys(layer.route.methods)
                .map(m => m.toUpperCase())
                .join(', ');
            console.log({ methods, url: `${prefix}${layer.route.path}` });
        } else if (layer.name === 'router' && layer.handle.stack) {
            // Layer is a nested router
            logRoutes(layer.handle.stack, prefix + (layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '') || ''));
        }
    }
}