
module.exports = function collect(collector) {
    return function (Component) {
        Component['collector'] = collector;
        return Component;
    }
}