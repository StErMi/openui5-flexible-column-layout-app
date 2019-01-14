sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/Device",
    "com/techedge/training/FlexibleColumnLayoutApp/model/Formatter",
    "sap/ui/core/UIComponent"
], function (Controller, Filter, FilterOperator, Sorter, DateFormat, Device, Formatter, UIComponent) {
	"use strict";

	return Controller.extend("com.techedge.training.FlexibleColumnLayoutApp.controller.BusinessPartnerDetail", {
		
		/////////////////////////////////////////////////////////
		// VARIABLES
		/////////////////////////////////////////////////////////
		
		formatter: Formatter,
		_businessPartnerID: null,
		_oDialog: null,
		_dateFormat: DateFormat.getDateInstance({pattern : "dd/MM/YYYY hh:mm" }),
		
		/////////////////////////////////////////////////////////
		// CONTROLLER LIFECYCLE EVENTS
		/////////////////////////////////////////////////////////
		
		onInit: function () {
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("TargetBusinessPartnerDetail").attachMatched(this.__onRouteMatched, this);
			
			var oController = this;
			this.mGroupFunctions = {
				CreatedAt: function(oContext) {
					var dCreatedAt = oContext.getProperty("CreatedAt");
					var sDateFormatted = oController._dateFormat.format(dCreatedAt);
					return {
						key: sDateFormatted,
						text: sDateFormatted
					};
				}
			};
		},
		
		__onRouteMatched: function(oEvent) {
			var that = this;
			this._businessPartnerID = oEvent.getParameter("arguments").BusinessPartnerID;
			this.getView().bindElement({
				path: "/BusinessPartnerSet('" + this._businessPartnerID + "')",
				events : {
					dataRequested: function () {
						that.getView().setBusy(true);
					},
					dataReceived: function () {
						that.getView().setBusy(false);
					}
				}
			});
		},

		onExit : function () {
		},
		
		/////////////////////////////////////////////////////////
		// LAYOUT EVENTS
		/////////////////////////////////////////////////////////
		
		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			var oModel = this.getView().getModel("app");
			oModel.setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			//this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getOwnerComponent().getRouter().navTo("TargeteBusinessPartnerList", {}, true);
		},
		
		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var oModel = this.getView().getModel("app");
			var bFullScreen = oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			oModel.setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				oModel.setProperty("/previousLayout", oModel.getProperty("/layout"));
				oModel.setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				oModel.setProperty("/layout",  oModel.getProperty("/previousLayout"));
			}
		},
		
		/////////////////////////////////////////////////////////
		// EVENTS
		/////////////////////////////////////////////////////////
		
		handleViewSettingsDialogButtonOpen: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.techedge.training.FlexibleColumnLayoutApp.view.fragment.dialog.SaleOrderViewSettingDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		
		handleViewSettingsDialogButtonConfirm: function(oEvent) {
			var oTable = this.byId("tableSalesOrder");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var sPath;
			var bDescending;
			var vGroup;
			var aSorters = [];
			
			// Gather grouping info
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup === undefined ? true : vGroup));
			}
			
			// Gather sorting info
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		
		onItemPress: function(oEvent) {
			var oItem = oEvent.getParameter("listItem");
			
			var sSalesOrderID = oItem.getBindingContext().getProperty("SalesOrderID");
			
			this.getOwnerComponent().getRouter().navTo("TargetBusinessPartnerSalesOrderDetail", 
				{
					BusinessPartnerID: this._businessPartnerID,
					SalesOrderID: sSalesOrderID
				}
			);
		},
		
		/////////////////////////////////////////////////////////
		// FILTERBAR EVENTS
		/////////////////////////////////////////////////////////
		
		onSearch: function(oEvent) {
			var oFilterModel = this.getView().getModel("filters");
			
			var sOrderId = oFilterModel.getProperty("/orderId");
			var sLifecycleStatus = oFilterModel.getProperty("/lifecycleStatus");
			var sBillingStatus = oFilterModel.getProperty("/billingStatus");
			var sDeliveryStatus = oFilterModel.getProperty("/deliveryStatus");
			var aFilters = [];
			
			if( sOrderId ) {
				aFilters.push( new Filter("SalesOrderID", FilterOperator.Contains, sOrderId) );
			}
			
			if( sLifecycleStatus ) {
				aFilters.push( new Filter("LifecycleStatus", FilterOperator.EQ, sLifecycleStatus) );
			}
			
			if( sBillingStatus ) {
				aFilters.push( new Filter("BillingStatus", FilterOperator.EQ, sBillingStatus) );
			}
			
			if( sDeliveryStatus ) {
				aFilters.push( new Filter("DeliveryStatus", FilterOperator.EQ, sDeliveryStatus) );
			}
			
			this.byId("tableSalesOrder").getBinding("items").filter(aFilters);
		},
		
		onClear: function(oEvent) {
			var oFilterModel = this.getView().getModel("filters");
			oFilterModel.setProperty("/", {});
			this.onSearch(null);
		}
		
	});
});