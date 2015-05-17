"use strict";

var EventHandler =  require('famous/core/EventHandler');
var Path = require('path');
var CollectionWidgets = require('./SearchFood/CollectionWidgets');
var SearchServices = require('./SearchFood/SearchServices');
var MeasureServices = require('./SearchFood/MeasureServices');
var SaveServices = require('./SearchFood/SaveServices');
var SelectedServices = require('./SearchFood/SelectedServices');
var GSelect = require('./SearchFood/GSelect');

var g_includes = ['famous.angular',
					//'ui.router',
					GSelect.name,
					CollectionWidgets.name,
					SearchServices.name,
					SelectedServices.name,
					MeasureServices.name,
					SaveServices.name];

var app = angular.module('foodoo', g_includes);
var elbody = angular.element(document.body);

app.run([/*'$ionicPlatform',*/ '$rootScope', function(/*$ionicPlatform,*/ $rootScope) {

	function broadcastResize() {
		$rootScope.$broadcast("resize", {
			'width':  elbody.prop("offsetWidth"),
			'height':  elbody.prop("offsetHeight")
		});
	}

	angular.element(window).on("resize", function(e){
		broadcastResize();
	});
      /*$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
		  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
		  StatusBar.styleDefault();
		}
		broadcastResize();
      });*/
	document.addEventListener("deviceready", function(){
		// NEEDS to broadcast resize in the beginning
		broadcastResize();
	}, false);
}]);

app.config(['$controllerProvider',/*'$stateProvider','$urlRouterProvider',*/ function(cp,$stateProvider,$urlRouterProvider){
	cp.register({
		"MainController": MainController
	});
}]);

app.directive({
	"dimTo": DimToDirective,
	"topOf": TopOfDirective,
	"evalOnResize": TriggerOnResizeDirective
});

MainController.$inject = ['$log', '$scope','$filter', 'SaveSvc','MeasureSvc','SearchFoodDesSvc', 'SelectedMealDetails', 'SelectedFood', 'SelectedTotal', 'SelectedSvc', '$timeout','$q','tgENERC_KCAL','Profile','GenderSelections'];
function MainController($log, $scope, $filter, SaveSvc,MeasureSvc, SearchFoodDesSvc, SelectedMealDetails, SelectedFood, SelectedTotal, SelectedSvc, $timeout, $q,tgENERC_KCAL,Profile,GenderSelections) {
	$scope.SelectedFood = SelectedFood;
	$scope.SelectedTotal = SelectedTotal;
	$scope.g = {
		SearchScrollPipe: new EventHandler()
	};
	var emptyFood = {weights:[], measureBy:{}};
	var DEFAULT_LIMIT=20;
	$scope.Profile = {};
	$scope.SelectedMealDetails = SelectedMealDetails;
	$scope.SearchLimit = DEFAULT_LIMIT;
	$scope.SearchNutrNo = "208";
	$scope.$watch("SearchLimit", function(){
		$scope.SearchResultHash = new Date().getTime();
	});

	function search(kw) {
		SearchFoodDesSvc.Search(kw, $scope.SearchNutrNo).then(function(res){
			$scope.$applyAsync(function(){
				$scope.SearchResult = res;
				$scope.SearchResultHash = new Date().getTime();
			})
		}, function(e){
			$scope.$applyAsync(function(){
				$scope.SearchResult = [];
				$scope.SearchResultHash = new Date().getTime();
				$scope.$applyAsync(function(){$scope.NothingFound = true;});
			})
		});
	}
	$scope.GetMeasureCnt = function(food) {
		if (!food.details) {
			food.details = {measureCnt:1}
		}
		if (!food.details.measureCnt) {
			food.details.measureCnt = 1;
		}
		return food.details.measureCnt;
	};
	$scope.GetNutrObj = function(food, nutrno) {
		if (!food.details || !food.details.measureBy) {
			return;
		}
		return food.details.measureBy[nutrno];
	}
	$scope.GetCurrNutrObj = function(food) {
		return $scope.GetNutrObj(food, food.details.CurrentNutrNo);
	}
	$scope.FormatAmt = function(f) {
		return ($filter('number')(f, 2)+'').replace(/[0]*$/g,"").replace(/\.*$/g,"");
	};
	$scope.FmtMeasureUnits = function(food) {
		var cnt = $scope.GetMeasureCnt(food);
		var bShow = !!food.details && !!food.details.measureSeq;
		if (!bShow) {
			return $scope.FormatAmt(cnt*food.amt) + ' ' + food.units;
		} else {
			var nutrobj = $scope.GetCurrNutrObj(food);
			if (!nutrobj) {
				return;
			}
			var amt = nutrobj[food.details.measureSeq].measure * cnt;
			return amt + ' ' + food.units;
		}
	};
	var mLastCallForSearch = new Date();
	var mSearchTimer = false;
	var mCooldown = 350;
	$scope.Search = function(kw) {
		$log.log("kw=", kw)
		$scope.$applyAsync(function(){
			$scope.NothingFound = false;
			$scope.SearchResult = [];
			$scope.SearchResultHash = new Date().getTime();
			$scope.SearchLimit = DEFAULT_LIMIT;
		});
		if (0==kw.length) {return;}
		if (mCooldown>(new Date()-mLastCallForSearch)) {
			if (!!mSearchTimer) {
				$timeout.cancel(mSearchTimer);
			}
		}
		mLastCallForSearch = new Date();
		mSearchTimer = $timeout(function(){
			search(kw);
		}, mCooldown)
	};
	$scope.FormatMeasure = function(details) {
		if (!details || !details.measureBy || !details.measureBy[details.CurrentNutrNo] || !details.measureSeq) {
			return
		}
		return details.measureBy[details.CurrentNutrNo][details.measureSeq].amt + ' ' + details.measureBy[details.CurrentNutrNo][details.measureSeq].measuredesc;
	}
	$scope.FormatUnits = function(food) {
		if (!food.details) {
			return food.measure_and_desc;
		}
		var nutrobj = $scope.GetNutrObj(food, food.details.CurrentNutrNo)
		if (!nutrobj) {
			return food.measure_and_desc;
		}
		var o = nutrobj[food.details.measureSeq];
		return o.amt + ' ' + o.measuredesc;
	};
	$scope.IsOkNutr = function(desc) {
		return !( /^\d/.test(desc) );
	};
	$scope.GetNutr = function(no) {
		return SearchFoodDesSvc.GetNutrDef(no);
	};
	/*
	$scope.ShowInfo = $mdUtil.debounce(function(){
		$mdSidenav("sidenavInfo").open().then(function(){
			$log.log("showing side");
		}, function(e){
			$log.log("failed showng side err=", e);
		});
	},300);*/
	$scope.CloseInfo = function() {
		$mdSidenav("sidenavInfo").close().then(function(){
			//on close
		})
	};

	var dialogParent = angular.element(document.getElementById("dialog-parent"));
	$scope.Save = function(e) {
		var scope = $scope.$new();
		scope['SelectedMealDetails'] = SelectedMealDetails;
		/*$mdDialog.show({
			templateUrl:"partials/saveform.html",
			targetEvent:e,
			scope:scope,
			disableParentScroll:true,
			parent:dialogParent
		})*/
	};
	$scope.NewProfile = function(e) {
		var scope = $scope.$new();
		scope['Profile'] = Profile;
		scope['GenderSelections'] = GenderSelections;
		scope['GetAge'] = SaveSvc.GetAge;
		/*$mdDialog.show({
			templateUrl:"partials/newprofile.html",
			targetEvent:e,
			scope:scope,
			disableParentScroll:true,
			parent:dialogParent
		})*/
	};
	$scope.CountTotalMsr =  function(food, wtno, nutrno) {
		var details = food.details;
		if (!details) {
			return;
		}
		if (!nutrno) {
			nutrno = !details.CurrentNutrNo?tgENERC_KCAL:details.CurrentNutrNo;
		}
		if (!wtno) {
			wtno = 1;
		}
		if (!details.measureBy || !details.measureBy[nutrno] || !details.measureBy[nutrno][wtno] ) {
			return;
		}
		if (!details.measureSeq) {
			details.measureSeq  = 1;
		}
		return details.measureBy[nutrno][wtno].measure*details.measureSeq;
	};
	$scope.LoadWeights = function(food,e) {
		if (!!e) {
			e.preventDefault();
			e.stopPropagation();
		}
		var details = SearchFoodDesSvc.GetDetails(food.getNDBNo());
		return details.then(function(obj){
			food.details = obj;
			if (!obj.measureBy) {
				obj.measureBy = {};
			} else {
				return;
			}
			if (!obj.measureCnt) {
				obj.measureCnt = 1;
			}
			if (!obj.measureSeq) {
				obj.measureSeq = 1;
			}
			if (!obj.CurrentNutrNo) {
				obj.CurrentNutrNo = tgENERC_KCAL;
			}
			if (!obj.weights) {
				obj.weights = obj.WeightGramList.list;
			}
			$scope.$applyAsync(function(){
				angular.forEach(obj.WeightGramList.list, function(wt){
					MeasureSvc.MeasureBy(obj,wt, function(nutrno, measure){
						if (!obj.measureBy.hasOwnProperty(nutrno)) {
							obj.measureBy[nutrno] = {};
						}
						obj.measureBy[nutrno][wt.Seq] = measure;
					});
				})
			});
			return obj;
		});
	};
	$scope.ShowNutrients = function(food,e) {
		$scope.LoadWeights(food,e);
		var scope = $scope.$new();
		scope['CurrentFood'] = food;
		scope['GetNutr'] = $scope.GetNutr;
		scope['GetTotalMsr'] = $scope.GetTotalMsr;
		scope['GetNutr'] = $scope.GetNutr;
		scope['IsOkNutr'] = $scope.IsOkNutr;
		scope['CountTotalMsr '] =$scope.CountTotalMsr;
		/*$mdDialog.show({
			templateUrl:"partials/viewnutrients.html",
			targetEvent:e,
			scope:scope,
			disableParentScroll:true,
			parent:dialogParent
		});*/
	};

	var g_selectedNutrs = [];
	$scope.GetSelectedNutrInfo = function() {
		if (0<g_selectedNutrs.length) {
			return g_selectedNutrs;
		}
		var sels = SearchFoodDesSvc.SelectedNutr();
		for(var i=0; i<sels.length;i++) {
			var o = SearchFoodDesSvc.GetNutrDef(sels[i]);
			if (!!o) {
				g_selectedNutrs.push(o);
			}

		}
		return g_selectedNutrs;
	};
}

DimToDirective.$inject = ['$log','$rootScope'];
function DimToDirective($log,$rootScope) {
	return {
		restrict: 'A',
		link: {
			post: function(scope, el, attr) {
				var value = attr['dimTo'];
				$rootScope.$on("resize", function(e, param){
					$rootScope.$applyAsync(function(){
						$rootScope[value] = {
							h: el.prop("offsetHeight"),
							w: el.prop("offsetWidth"),
						}
					});
				});

				$rootScope.$applyAsync(function(){
					$rootScope[value] = {
						h: el.prop("offsetHeight"),
						w: el.prop("offsetWidth"),
					}
				});

			}
		}
	}
}


TopOfDirective.$inject = ['$log'];
function TopOfDirective($log) {
	return {
		restrict: 'A',
		link: {
			post: function(scope, el, attr) {
				var value = attr['topOf'];
				scope.$on("resize", function(e, param){
					scope.$applyAsync(function(){
						scope[value] = el.prop("offsetTop");
					});
				});

				scope.$applyAsync(function(){
					scope[value] = el.prop("offsetTop");
				});

			}
		}
	}
}

TriggerOnResizeDirective.$inject = ['$log'];
function TriggerOnResizeDirective($log) {
	return {
		restrict: 'A',
		link: {
			post: function(scope, el, attr) {
				scope.$eval(attr['evalOnResize']);
				function doeval() {
					scope.$applyAsync(function(){
						scope.$eval(attr['evalOnResize']);
					})
				}
				el.on("resize", function(e, param){
					doeval();
				});
				scope.$on("resize", function(e, param){
					doeval();
				});

			}
		}
	}
}

