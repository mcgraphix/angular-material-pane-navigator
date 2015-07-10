/**
 * Created by rob mckeown on 7/8/15.
 */
(function () {
    'use strict';

    /**
     * Create a swipable set of panels
     *
     */
    angular.module('mgx.panenavigator', ['ngMaterial'])
        .directive('mgxPaneNavigator', function ($log, $timeout) {
            return {
                scope: true,
                link: function (scope, element, attrs) {
                    scope.idx = 0;
                    scope.previousSiblingsCount = 0;

                    $(element).addClass("mgx-pane-navigator");
                    $(element).parent().append("<ul class=\"indicators\"></ul>");

                    var setup = function () {
                        //we need to size the panels, add the indicators and hool up event listeners
                        $("ul.indicators li", element.parent()).remove();

                        var panelSize = $(element).width();
                        $("ul.indicators", element.parent()).width(panelSize);

                        $(element).css("transform", "translateX(0)");

                        $("> div", element).each(function (idx, li) {
                            $(li).attr("data-idx", idx);
                            $(li).css("transform", "translateX(" + (idx * panelSize) + "px)");
                            if (idx === scope.idx) {
                                $(element).siblings("ul.indicators").append("<li class=\"active\">&nbsp;</li>");
                            } else {
                                $(element).siblings("ul.indicators").append("<li>&nbsp;</li>");
                            }

                            $(li).off("$md.swipeleft", scope.onSwipeLeft);
                            $(li).on("$md.swipeleft", scope.onSwipeLeft);
                            $(li).off("$md.swiperight", scope.onSwipeRight);
                            $(li).on("$md.swiperight", scope.onSwipeRight);
                        });


                    };


                    scope.onSwipeLeft = function () {

                        scope.idx++;
                        if (scope.idx > $("> div", element).length - 1) {
                            scope.idx = 0;
                        }
                        scope.scrollToIndex();
                    };

                    scope.onSwipeRight = function () {

                        scope.idx--;
                        if (scope.idx < 0) {
                            scope.idx = $("> div", element).length - 1;
                        }
                        scope.scrollToIndex();
                    };


                    setup();

                    scope.hilightCorrectIndicator = function() {
                        $("ul.indicators li:eq(" + scope.idx + ")", element.parent()).addClass("active");
                        $("ul.indicators li:eq(" + scope.idx + ")", element.parent()).siblings().removeClass("active");
                    };

                    scope.scrollToIndex = function () {
                        var panelSize = $(element).width();
                        $(element).css("transform", "translateX( " + (panelSize * scope.idx * -1) + "px)");
                        scope.hilightCorrectIndicator();

                    };

                    $(element).on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                        //in case this element has css transition on it size properties, we need
                        //to adjust after the transition has ended
                        setup();
                        scope.scrollToIndex();
                    });

                    $(window).resize(function () {

                            setup();
                            scope.scrollToIndex();

                    });

                    //when child nodes are change, we want to
                    scope.$watch(
                        function () {
                            return element[0].childNodes.length;
                        },
                        function (newValue, oldValue) {
                            if (newValue !== oldValue) {

                                //we only care if a new one was added before the current or if
                                //one was deleted before it

                                var newOnesBefore = $(">div[data-idx=" + scope.idx + "]", element).prevAll(":not([data-idx])").length;

                                //determining missing ones before is based on the length of the previous siblings compared to the
                                //data-idx of the current one

                                var removedOnesBefore = scope.idx - $(">div[data-idx=" + scope.idx + "]", element).prevAll("[data-idx]").length;


                                var adjustmentBefore = newOnesBefore - removedOnesBefore;
                                scope.idx += adjustmentBefore;
                                setup();
                                scope.scrollToIndex();
                            }
                        }
                    );

                }
            };
        });
})();