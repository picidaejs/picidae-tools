function collect(collector = collect.defaultCollector) {
	if (typeof collector === 'string') {
		collector = defaultCollectorMaker(collector)
	}
    return function (Component) {
        Component['collector'] = collector;
        return Component;
    }
}

function defaultCollectorMaker(name = 'pageData') {
	return async function (nextProps) {
		if (nextProps.pageData) {
	        let data = await nextProps.pageData()
	        return {[name]: data};
	    }
	    return false;
	}
}

collect.defaultCollector = defaultCollectorMaker();
module.exports = collect;