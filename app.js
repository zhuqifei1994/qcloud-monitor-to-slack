var co = require('co');
var schedule = require('node-schedule');
var moment = require('moment');
var utils = require('./utils');
var qcloud = require('./lib/qcloud');
var dedent = require('dedent-js');
var express = require('express');
var app = express();

var node = qcloud.nodeMonitor;
var cpu = qcloud.cpuMonitor;
var memory = qcloud.memMonitor;

var Slack = require('node-slack');
var slack = new Slack(process.env.SLACK_HOOK_URL);

function checkServerData(regionCode) {
    return co(function* () {
        var regions = {
            bj: {
                name: "bj",
                fulltext: '北京节点监控'
            },
            gz: {
                name: "gz",
                fulltext: '广州节点监控'
            },
            sh: {
                name: "sh",
                fulltext: '上海节点监控'
            },
            hk: {
                name: "hk",
                fulltext: '香港节点监控'
            },
            ca: {
                name: "ca",
                fulltext: '北美节点监控'
            },
            sg: {
                name: "cg",
                fulltext: '新加坡节点监控'
            }
        }
        var region = regions[regionCode];

        console.log(`check servers stats, region: ${region.name}`);
        var data = yield node(region.name);
        var name_dataList = utils.nodeName(data);

        console.log(`get cpu stats, region: ${region.name}`);
        var cpu_dataAverage = yield utils.monitorData(region.name, data, cpu);

        console.log(`get memory stats, region: ${region.name}`);
        var mem_dataAverage = yield utils.monitorData(region.name, data, memory);

        var cpu_Max = yield utils.maxData(region.name, data, cpu);
        var mem_Max = yield utils.maxData(region.name, data, memory);

        var node_total = data.totalCount;
        var attachments = [];
        for (var i = 0; i < node_total; i++) {
            var node_name = name_dataList[i];
            var cpu_data = cpu_dataAverage[i].toFixed(2);
            var mem_data = mem_dataAverage[i].toFixed(2);
            var cpu_max = cpu_Max[i].toFixed(2);
            var mem_max = mem_Max[i].toFixed(2);

            var color;
            if (cpu_data >= 80 || mem_data >= 80) {
                color = 'danger';
            } else if (cpu_data >= 70 || mem_data >= 70) {
                color = 'warning';
            } else {
                color = 'good';
            }

            attachments.push({
                title: `${node_name}`,
                color: color,
                text: dedent`
				CPU (平均值:${cpu_data}% ; 峰值:${cpu_max}%)
				内存 (平均值:${mem_data}% ; 峰值:${mem_max}%)
				`
            });
        }

        console.log(`send stats to slack channel, region: ${region.name}`);
        yield slack.send({
            text: region.fulltext,
            attachments: attachments,
            channel: process.env.SLACK_CHANNEL
        });
    }).then(() => {
        console.log("qcloud monitor done!")
    }).catch(e => {
        console.error(e);
    });
}

var port = 8080;
app.listen(port, () => {
    console.log('listening on port', port);
});