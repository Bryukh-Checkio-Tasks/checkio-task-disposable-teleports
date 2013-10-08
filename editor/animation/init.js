//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        var cell = 50;
        var zeroX = 20;
        var zeroY = 20;
        var radius = 15;
        var colorBase = "#294270";
        var colorOrange = "#F0801A";
        var colorBlue = "#65A1CF";
        var colorWhite = "#FFFFFF"
        var delay = 200;
        var stepDelay = delay * 5;
        var attrLine = {"stroke-width": 4, "stroke": colorBlue};
        var attrText = {"stroke": colorBase, "font-size": 16};


        function createCirclesCanvas(paper, circlesSet) {
            var attrCircle = {"stroke": colorBase, "stroke-width": 5, "fill": colorWhite};
            circlesSet.push(paper.circle(zeroX, zeroY, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX + 4 * cell, zeroY, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX + 2 * cell, zeroY + cell - radius, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX + cell - radius, zeroY + 2 * cell, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX + 3 * cell + radius, zeroY + 2 * cell, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX + 2 * cell, zeroY + 3 * cell + radius, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX, zeroY + 4 * cell, radius).attr(attrCircle));
            circlesSet.push(paper.circle(zeroX + 4 * cell, zeroY + 4 * cell, radius).attr(attrCircle));
            return paper;
        }

        function createLinePath(x1, y1, x2, y2) {
            return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
        }

        function movePlayer(route, player, cSet, lDict, timeouts) {
            for (var i = 0; i < route.length - 1; i++) {
                var from = parseInt(route[i]) - 1;
                var to = parseInt(route[i + 1]) - 1;
                var xto = cSet[to].attr().cx;
                var yto = cSet[to].attr().cy;
                timeouts.push(setTimeout(function () {
                    var f = from;
                    return function () {
                        player.animate({"r": 5}, delay);
                        cSet[f].attr("fill", colorBlue);
                    }
                }(), i * stepDelay));
                timeouts.push(setTimeout(function () {
                    var x = xto;
                    var y = yto;
                    return function () {
                        player.animate({"cx": x, "cy": y}, delay * 3);
                    }
                }(), i * stepDelay + delay));
                timeouts.push(setTimeout(function () {
                    var x = xto;
                    var y = yto;
                    var lIndex = route[i] + route[i + 1];
                    return function () {
                        player.animate({"r": 12}, delay);
                        lDict[lIndex].animate({"path": createLinePath(x, y, x, y)}, delay * 3);
                    }
                }(), i * stepDelay + delay * 4));

            }
        }


        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];
            var route = result_addon[0];
            var message = result_addon[1];

            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult) + ' <br>' + message);

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            var canvas = Raphael($content.find(".explanation")[0], 240, 240, 0, 0);
            var circleSet = canvas.set();
            createCirclesCanvas(canvas, circleSet);

            var lineDict = canvas.set();
            var numbers = canvas.set();
            for (var i = 0; i < circleSet.length; i++) {
                var x = circleSet[i].attr().cx;
                var y = circleSet[i].attr().cy;
                numbers.push(canvas.text(x, y, String(i + 1)).attr(attrText));
            }

            var lines = checkioInput.split(',').map(function (x) {
                var first = parseInt(x[0]);
                var second = parseInt(x[1]);
                return first < second ? [first, second] : [second, first];
            });

            for (i = 0; i < lines.length; i++) {
                var start = lines[i][0];
                var end = lines[i][1];
                var x1 = circleSet[start - 1].attr().cx;
                var y1 = circleSet[start - 1].attr().cy;
                var x2 = circleSet[end - 1].attr().cx;
                var y2 = circleSet[end - 1].attr().cy;
                var line = canvas.path(createLinePath(x1, y1, x2, y2)).attr(attrLine);
                lineDict[String(start) + String(end)] = line;
                lineDict[String(end) + String(start)] = line;
            }

            circleSet.toFront();
            numbers.toFront();

            var player = canvas.circle(circleSet[0].attr().cx, circleSet[0].attr().cx, 12).attr("fill", colorOrange);
            player.insertBefore(numbers);


            movePlayer(route, player, circleSet, lineDict, []);


            this_e.setAnimationHeight($content.height() + 60);

        });

        function checkRoute(route, lines) {
            var start = "1";
            var tempLines = lines.slice(0);
            if (typeof(route) !== "string") {
                return [false, '', 'Checkio return not string'];
            }
            if (route.length < 1) {
                return [false, '', "Route not started"];
            }
            if (route[0] !== '1' || route.slice(-1) !== '1') {
                return [false, '', "Route must started and ended at 1"]
            }
            var chRoute = route[0];
            for (var i = 0; i < route.length - 1; i++) {
                var step = route.substr(i, 2);
                var rStep = step[1] + step[0];
                if (tempLines.indexOf(step) === -1 && tempLines.indexOf(rStep) === -1) {
                    return [false, chRoute, "No way from " + step[0] + " to " + step[1]];
                }
                step = tempLines.indexOf(step) === -1 ? rStep : step;
                tempLines.splice(tempLines.indexOf(step), 1);
                chRoute += route[i + 1];
            }
            for (var j = 1; j <= 8; j++) {
                if (chRoute.indexOf(String(j)) === -1) {
                    return [false, chRoute, "You forget about " + j];
                }
            }
            return [true, chRoute, "Success"];

        }


        var $tryit;
        var tCanvas;
        var activeLine;
        var activeEl;
        var worked = false;
        var tIds = [];
        var tPlayer;
        var tCircleSet;
        var dragSet;
        var tLineDict = {};
        var tIds = [];
        var lines;
        var tooltip = false;
        var tmouse = {
            "down": false,
            "x": 0,
            "y": 0
        };

        ext.set_console_process_ret(function (this_e, ret) {
            var route = ret.replace(/'/g, "");
            var resCheck = checkRoute(route, lines);

            worked = true;
            movePlayer(resCheck[1], tPlayer, tCircleSet, tLineDict, tIds);
            $tryit.find(".checkio-result .in-result").html(resCheck[2]);

        });

        ext.set_generate_animation_panel(function (this_e) {

            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));
            tCanvas = Raphael($tryit.find(".tryit-canvas")[0], 240, 240, 0, 0);
            tCircleSet = tCanvas.set();
            dragSet = tCanvas.set();
            activeEl = tCanvas.rect(0, 0, 240, 240).attr({"stroke-width": 1, "fill": "#ffffff", "opacity": 0});

            createCirclesCanvas(tCanvas, tCircleSet);

            var tNumbers = tCanvas.set();
            for (var i = 0; i < tCircleSet.length; i++) {
                var x = tCircleSet[i].attr().cx;
                var y = tCircleSet[i].attr().cy;
                tNumbers.push(tCanvas.text(x, y, String(i + 1)).attr(attrText));
            }

            lines = ["12", "23", "34", "45", "56", "67", "78", "81", "17", "28"];

            var deleteLine = function () {

                lines.splice(lines.indexOf(this["mark"]), 1);
                this.remove();
                if (worked) {
                    worked = false;
                    reset();
                }
            };

            var reset = function () {
                for (l in tLineDict) {
                    tLineDict[l].remove();
                }
                for (var i = 0; i < tIds.length; i++) {
                    clearTimeout(tIds[i]);
                }
                for (i = 0; i < lines.length; i++) {
                    var start = parseInt(lines[i][0]);
                    var end = parseInt(lines[i][1]);
                    var x1 = tCircleSet[start - 1].attr().cx;
                    var y1 = tCircleSet[start - 1].attr().cy;
                    var x2 = tCircleSet[end - 1].attr().cx;
                    var y2 = tCircleSet[end - 1].attr().cy;
                    var line = tCanvas.path(createLinePath(x1, y1, x2, y2)).attr(attrLine);
                    line["mark"] = lines[i];
                    tLineDict[String(start) + String(end)] = line;
                    tLineDict[String(end) + String(start)] = line;
                    line.click(deleteLine);
                    tCircleSet.toFront();
                    tNumbers.toFront();
                    dragSet.toFront();
//                    activeEl.toBack();
                }
                for (var i = 0; i < tCircleSet.length; i++) {
                    tCircleSet[i].attr("fill", colorWhite);
                }
                tPlayer = tCanvas.circle(tCircleSet[0].attr().cx, tCircleSet[0].attr().cx, 12).attr("fill", colorOrange);
                tPlayer.insertBefore(tNumbers);
            };
            reset();

            $tryit.find(".tryit-canvas").mouseenter(function (e) {
                if (tooltip) {
                    return false;
                }
                var $tooltip = $tryit.find(".tryit-canvas .tooltip");
                $tooltip.fadeIn(1000);
                setTimeout(function () {
                    $tooltip.fadeOut(1000);
                }, 2000);
                tooltip = true;
            });

            $tryit.find(".tryit-canvas").mouseup(function (e) {
                if (activeLine) {
                    activeLine.remove();
                }
                tmouse.down = false;
            });
            activeEl.mousemove(function (e) {
                if (tmouse.down) {
                    activeLine.attr("path", createLinePath(tmouse.x, tmouse.y, e.offsetX, e.offsetY));
                }
            });

            for (i = 0; i < tCircleSet.length; i++) {
                var cx = tCircleSet[i].attr().cx;
                var cy = tCircleSet[i].attr().cy;
                var dragCircle = tCanvas.circle(cx, cy, radius).attr({"opacity": 0, "fill": colorBase});
                dragSet.push(dragCircle);
                dragCircle.mark = i + 1;
                dragCircle.toFront();
                dragCircle.mouseup(function (e) {
                    tmouse.down = false;
                    activeLine.remove();
                    var endCx = this.attr().cx;
                    var endCy = this.attr().cy;
                    var lineMark = tmouse.mark > this.mark ? String(this.mark) + String(tmouse.mark) : String(tmouse.mark) + String(this.mark);
                    if (lines.indexOf(lineMark) === -1) {
                        lines.push(lineMark);
                        var newLine = tCanvas.path(createLinePath(tmouse.x, tmouse.y, endCx, endCy)).attr(attrLine);
                        newLine.insertBefore(tCircleSet);
                        newLine.mark = lineMark;
                        newLine.click(deleteLine);
                        tLineDict[lineMark] = newLine;
                        tLineDict[lineMark[1] + lineMark[0]] = newLine;
                    }
                    //            }
                });
                dragCircle.mousedown(function (event) {
                    if (worked) {
                        worked = false;
                        reset();
                    }
                    tmouse.down = true;
                    tmouse.x = this.attr().cx;
                    tmouse.y = this.attr().cy;
                    tmouse.mark = this.mark;
                    event.preventDefault();
                    activeLine = tCanvas.path(createLinePath(this.attr().cx, this.attr().cy, this.attr().cx, this.attr().cy)).attr(attrLine);
                });
                dragCircle.mouseover(function (e) {
                    if (tmouse.down) {
                        activeLine.attr("path", createLinePath(tmouse.x, tmouse.y, this.attr().cx, this.attr().cy));
                    }
                });
                var dMove = function (dx, dy) {
                    var cx = this.attr().cx;
                    var cy = this.attr().cy;
                    activeLine.attr("path", createLinePath(cx, cy, event.layerX, event.layerY));
                };


            }
            $tryit.find('.bn-check').click(function (e) {
                if (worked) {
                    worked = false;
                    reset();
                }
                var data = lines.join(',');
                this_e.sendToConsoleCheckiO(data);
                e.stopPropagation();
                return false;

            });

        });


    }
);
