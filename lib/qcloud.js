var Capi = require('qcloudapi-sdk');
var moment = require('moment');
var signature = require('./signature');

var capiCommonOptions = {
	SecretId: process.env.QCLOUD_SECRET_ID,
	SecretKey: process.env.QCLOUD_SECRET_KEY,
	baseHost: 'api.qcloud.com',
	method: 'POST',
	path: '/v2/index.php'
}

function nodeMonitor(region) {
	return new Promise((resolve, reject) => {
		var options = Object.assign({}, capiCommonOptions, {
			serviceType: 'cvm'
		});

		var capiNode = new Capi(options);
		capiNode.request({
			Action: 'DescribeInstances',
			Region: region
		}, function (error, data) {
			if (error) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	});
}

function cpuMonitor(region, node_id) {
	var StartTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
	var EndTime = moment().format('YYYY-MM-DD');

	return new Promise((resolve, reject) => {
		var options = Object.assign({}, capiCommonOptions, {
			Signature: signature,
			serviceType: 'monitor'
		});

		var capiMonitor = new Capi(options);

		capiMonitor.request({
			Action: 'GetMonitorData',
			Region: region,
			namespace: 'qce/cvm',
			metricName: 'cpu_usage',
			startTime: StartTime,
			endTime: EndTime,
			'dimensions.0.name': 'unInstanceId',
			'dimensions.0.value': node_id,
			period: '300'
		}, function (error, data) {
			if (error) {
				reject(error);
			} else {
				resolve(data.dataPoints);
			}
		});
	});
}

function memMonitor(region, node_id) {
	var StartTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
	var EndTime = moment().format('YYYY-MM-DD')

	return new Promise((resolve, reject) => {
		var options = Object.assign({}, capiCommonOptions, {
			Signature: signature,
			serviceType: 'monitor'
		});

		var capiMonitor = new Capi(options);
		capiMonitor.request({
			Action: 'GetMonitorData',
			Region: region,
			namespace: 'qce/cvm',
			metricName: 'mem_usage',
			startTime: StartTime,
			endTime: EndTime,
			'dimensions.0.name': 'unInstanceId',
			'dimensions.0.value': node_id,
			period: '300'
		}, function (error, data) {
			if (error) {
				reject(error);
			} else {
				resolve(data.dataPoints);
			}
		});
	});
}

module.exports = {
	nodeMonitor,
	cpuMonitor,
	memMonitor
}
