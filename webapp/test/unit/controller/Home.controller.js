/*global QUnit*/

sap.ui.define([
	"com/techedge/training/FlexibleColumnLayoutApp/controller/Home.controller"
], function (oController) {
	"use strict";

	QUnit.module("Home Controller");

	QUnit.test("I should test the Home controller", function (assert) {
		var oAppController = new oController();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});