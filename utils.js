var co = require('co');

// 节点主机名
function nodeName(data) {
	return data.instanceSet.map(item => item.instanceName);
}

//监控的数据
function monitorData(region, data, type) {
	return co(function* () {
		var nodeId = data.instanceSet.map(item => item.unInstanceId);
		var node_total = data.totalCount;
		var dataAverage = [];
		for (var i = 0; i < node_total; i++) {
			var node_id = nodeId[i];
			var node_data = yield type(region, node_id);
			var average = node_data.length;
			var sum = node_data.reduce((previous, current) => current += previous);
			var avg = sum / average;
			dataAverage.push(avg);
		}
		return dataAverage;
	});
}

//监控数据峰值
function maxData(region, data, type) {
	return co(function* () {
		var nodeId = data.instanceSet.map(item => item.unInstanceId);
		var node_total = data.totalCount;
		var datamax = [];
		Array.prototype.max = function () {
			var max = this[0];
			for (var i = 1; i < this.length; i++) {
				if (this[i] > max) {
					max = this[i];
				}
			}
			return max;
		}
		for (var i = 0; i < node_total; i++) {
			var node_id = nodeId[i];
			var node_data = yield type(region, node_id);
			var node_max = node_data.max();
			datamax.push(node_max);
		}
		return datamax;
	});
}

module.exports = {
	nodeName,
	monitorData,
	maxData
}