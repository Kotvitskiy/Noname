﻿
function Chart() {
    $(window).off('resize');
    var plotColors = ['rgba(234, 204, 102, .4)', 'rgba(234, 204, 102, .6)', 'rgba(234, 204, 102, .8)'];
    var height = function () { return $(window).height() * 0.75; };

    var getLineIntersection = function (p0, p1, p2, p3) {
        var p0_x = p0.x,
        p0_y = p0.y,
        p1_x = p1.x,
        p1_y = p1.y,
        p2_x = p2.x,
        p2_y = p2.y,
        p3_x = p3.x,
        p3_y = p3.y;

        var s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x; s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x; s2_y = p3_y - p2_y;

        var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y),
            t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return {
                x: p0_x + (t * s1_x),
                y: p0_y + (t * s1_y),
                myName: 'crossPoint'
            };
        }

        return false;
    };

    var tuneChart = function (chart) {

        var customizeIntersectedData = function () {
            var retData = [],
                length = chart.series.length;
            for (var i = 0; i < length-1; i++) {
                var data = addPointToLine(chart.series[length-1].points, chart.series[i].points, chart.series[length - 1]);
                retData.push(data);                              
                selectPoint(chart.series[length-1], data);
            }

            retData.sort(function (a, b) {
                if (a.saveIsect.x > b.saveIsect.x)
                    return 1;
                if (a.saveIsect.x === b.saveIsect.x)
                    return 0;                
                return -1;
            });
            var ticks = [];
            for (var i = 0; i < retData.length; i++) {
                ticks.push(retData[i].saveIsect.x.toFixed(1));
                if (retData[i + 1]) retData[i].mx = retData[i + 1].saveIsect.x;
                addPlotChart(retData[i], plotColors[i] || '#FFEFD5');
            }
            chart.xAxis[0].update({ additionalTicks: ticks });
            chart.redraw();
        };

        var addPlotChart = function (data, col) {
            chart.xAxis[0].addPlotBand({
                from: data.saveIsect.x,
                to: data.mx,
                color: col,
                name: 'cross'
            })
        };

        var selectPoint = function (line, retData) {
            for (var p = 0; p < line.data.length; p++) {
                if (line.data[p].x == retData.saveIsect.x && line.data[p].y == retData.saveIsect.y) {
                    line.data[p].select(true,true);
                    chart.redraw();
                };
            }
        };

        var addPointToLine = function (linePoints1, linePoints2, linePointsTo) {
            var n0 = linePoints1.length,
            n1 = linePoints2.length;
            var i, j, isect, isect2;
            var saveIsect;
            var mx = -100;
            for (i = 1; i < n0; i++) {
                for (j = 1; j < n1; j++) {
                    if (linePoints1[i - 1].y > mx) mx = linePoints1[i - 1].y;
                    if (linePoints1[i].y > mx) mx = linePoints1[i].y;
                    if (isect = getLineIntersection(linePoints1[i - 1], linePoints1[i],
                                        linePoints2[j - 1], linePoints2[j])) {
                        linePointsTo.addPoint(isect, true, false);
                        saveIsect = isect;
                    }
                }
            }
            var ret = new Object();
            ret.saveIsect = saveIsect;
            ret.mx = mx;
            return ret;
        };        

        chart.setSize($(".chartWrapper").width(), height(), false);

        if (chart.series[0].points.length != 0 || chart.series[1].points.length != 0) {
            customizeIntersectedData();
        }

        $(window).on('resize', function () {
            chart.setSize($(".chartWrapper").width(), height(), false);
            chart.redraw();
        });
    };

    return {
        draw: function (conteiner, dataObj, title, yAxisCaption, xAxisCaption, dotCaption, valueTypes, out) {
            var max = 0;
            for(var i = 0; i < dataObj.length; i++){
                var data = dataObj[i].data;
                for (var j = 0; j < data.length; j++) {
                    if (data[j].y && data[j].y > max) max = data[j].y; //for arr of objects
                    else if (data[j][1] && data[j][1] > max) max = data[j][1]; // for arr of arrays
                    else if (data[j] > max) max = data[j];   //for arr of y values
                }
            }
            var interval = Math.ceil(max/4000)*1000;

            var unique = function (arr) {
                var result = [];

                nextInput:
                    for (var i = 0; i < arr.length; i++) {
                        var item = arr[i];
                        for (var j = 0; j < result.length; j++) {
                            if (result[j] == item) continue nextInput;
                        }
                        result.push(item);
                    }

                return result;
            }

            if ($(conteiner).highcharts()) {
                $(conteiner).highcharts().destroy();
                $(conteiner).html('');
            }

            $(conteiner).highcharts({
                chart: {
                    type: 'spline',
                    zoomtype: "xy"
                },
                title: {
                    text: title,
                    style: {
                        'text-transform': 'uppercase',
                        fontWeight: 'bold'
                    }
                },
                yAxis: {
                    title: {
                        enabled: true,
                        text: yAxisCaption
                    },
                    max: max + Math.round(max * 0.1),
                    min: 0,
                    labels: {                
                        formatter: function () {                         
                            return this.value;
                        }
                    },
                    minorTickInterval: interval/2, //to 1 minor tick per 2 labels
                    maxPadding: 0.5,
                    tickInterval: interval,
                },
                xAxis: {
                    tickPositioner: function (min, max) {
                        var positions = [];
                        for (var tick = min; tick < max; tick++)
                            positions.push(tick);
                        if (this.options.additionalTicks) {
                            positions = positions.concat(this.options.additionalTicks);
                            positions.sort(function (a, b) { return a - b; });
                        }
                        return unique(positions);
                    },
                    
                    tickmarkPlacement: 'on',
                    title: {
                        text: xAxisCaption
                    },
                    labels: {
                        autoRotationLimit: 100,
                        maxStaggerLines: 1,                        
                        formatter: function () {
                            if(+this.value !== 0)
                                return this.value;
                            return '';
                        }                        
                    },
                    min: 0,
                    startOnTick: true,
                    align: "left"
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br/>',
                    crosshairs: [{
                        color: '#669999',
                        width: 1
                    }],
                    formatter: function () {

                        var header = '<strong>' + this.series.name + '</strong><br/>';

                        var year = (+this.x).toFixed(1),
                            yearStr = valueTypes.manyYears;
                        if (year - Math.ceil(year) === 0) {
                            year = Math.ceil(year);
                            if (year < 10 || year > 20) {                                
                                var last = year % 10;
                                if (last === 1) yearStr = valueTypes.oneYear;
                                else if (last > 1 && last < 5) yearStr = valueTypes.fewYears;
                            }
                        }
                        return header + this.y.toFixed(0) + ' ' + valueTypes.UAH + ',  ' + year + ' ' + yearStr;
                    }
                },
                plotOptions: {
                    spline: {
                        marker: {
                            enable: false
                        }
                    },
                    series: {
                        dataLabels: {
                            enabled: false,                            
                            align: 'left',
                            formatter: function () {
                                if (this.point.myName !== 'crossPoint') return;
                                var year = (+this.x).toFixed(1),
                                    yearStr = valueTypes.manyYears;
                                if (year - Math.ceil(year) === 0) {
                                    year = Math.ceil(year);
                                    var last = year % 10;
                                    if (last === 1) yearStr = valueTypes.oneYear;
                                    else if (last > 1 && last < 5) yearStr = valueTypes.fewYears;
                                }
                                return this.y.toFixed(0) + ' ' + valueTypes.UAH + ',  ' + year + ' ' + yearStr;                        
                            }
                        }
                    }
                },
                series: dataObj
            }, function (chart) { tuneChart(chart)});
        }
    };
};
