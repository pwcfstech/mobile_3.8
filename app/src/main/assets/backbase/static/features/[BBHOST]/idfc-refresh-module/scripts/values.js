define(function (require, exports) {
    'use strict';
    var Bus;
	var initialize;
	var grpInitialize;
	var accountGrpInitialize;
	var FDGrpInitialize;
	var RDGrpInitialize;
	var debitInitialize;
	var fundTransferGrpInitialize;
	var groupLoansInitialize;
	/**
	*Main function was called
	*/
    function getDeckPanelOpenHandler (widget) {
        return function deckPanelOpenHandler(activePanelName) {
            if (activePanelName === widget.parentNode.model.name) {
               // Bus.flush('DeckPanelOpen');
                initialize();
            }
        };
    }
	
	/**
	*Main function was called in case of group Widget
	*/
    function getDeckPanelOpenHandlerGroupWidget (widget) {
        return function deckPanelOpenHandler(activePanelName) {
            if (activePanelName === widget.parentNode.model.name) {
                Bus.flush('DeckPanelOpen');
            }
        };
    }
	
	/**
	*Main function was called in case of group Widget BillPay
	*/
    function getDeckPanelOpenHandlerGroupBillPay (widget) {
        return function deckPanelOpenHandler(activePanelName) {
            if (activePanelName === widget.parentNode.model.name) {
               // Bus.flush('DeckTabOpen');
				grpInitialize();
            }
        };
    }


	/* PL Loan start*/

	/**
	*Main function was called in case of group Widget BillPay
	*/
	function getDeckPanelOpenHandlerAccounts (widget) {
        	return function deckPanelOpenHandler(activePanelName) {
            		if (activePanelName === widget.parentNode.model.name) {
               		// Bus.flush('DeckTabOpen');
				accountGrpInitialize();
            		}
        	};
    	}

	function getDeckPanelOpenHandlerFD (widget) {
        	return function deckPanelOpenHandler(activePanelName) {
            		if (activePanelName === widget.parentNode.model.name) {
               		// Bus.flush('DeckTabOpen');
				FDGrpInitialize();
            		}
        	};
    	}


	function getDeckPanelOpenHandlerRD (widget) {
        	return function deckPanelOpenHandler(activePanelName) {
            		if (activePanelName === widget.parentNode.model.name) {
               		// Bus.flush('DeckTabOpen');
				RDGrpInitialize();
            		}
        	};
    	}


	function getDeckPanelOpenHandlerDebitCard (widget) {
        	return function deckPanelOpenHandler(activePanelName) {
            		if (activePanelName === widget.parentNode.model.name) {
               		// Bus.flush('DeckTabOpen');
				debitInitialize();
            		}
        	};
    	}


	function getDeckPanelOpenHandlerFundTransfer(widget) {
        	return function deckPanelOpenHandler(activePanelName) {
            		if (activePanelName === widget.parentNode.model.name) {
               		// Bus.flush('DeckTabOpen');
				fundTransferGrpInitialize();
            		}
        	};
    	}


	function getDeckPanelOpenHandlerGroupLoans (widget) {
        	return function deckPanelOpenHandler(activePanelName) {
            		if (activePanelName === widget.parentNode.model.name) {
               		// Bus.flush('DeckTabOpen');
				groupLoansInitialize();
            		}
        	};
    	}

	

	/* PL Loan End*/

	
	/**
	*notify the panel - Publish the Channel Name
	*/
    var notify = function (panel) {
        if(panel){
            Bus.publish('DeckPanelOpen', panel.model.name);
        }
    };
	
	/**
	*listen the panel - Subscribe the Channel Name
	*/
    var listen = function (widget) {
        Bus.subscribe('DeckPanelOpen', getDeckPanelOpenHandler(widget));
    };
	
	
	/**
	*notify the panel - Publish the Channel Name - Billpay Panel 
	*/
    var notifyBillPay = function (panel) {
        if(panel){
            Bus.publish('DeckTabOpen', panel.model.name);
        }
    };
	
	/**
	*listen the panel - Subscribe the Channel Name -Billpay Panel
	*/
    var listenBillPay = function (widget) {
        Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerGroupBillPay(widget));
    };
	
	
	
	/**
	*listenGroupWidget the panel in case of Group widget - Subscribe the Channel Name
	*/
    var listenGroupWidget = function (widget) {
        Bus.subscribe('DeckPanelOpen', getDeckPanelOpenHandlerGroupWidget(widget));
    };


	/*PL Loan start*/

	/**
	*listenGroupWidget the panel in case of Group widget - Subscribe the Channel Name
	*/
        var listenAccountGroupWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerAccounts(widget));
    	};

	var notifyAccountGrp = function (panel) {
            if(panel){
		Bus.publish('DeckTabOpen', panel.model.name);
	    }
    	};

	var listenAccountGroupWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerAccounts(widget));
    	};


	var listenFDGroupWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerFD(widget));
    	};


	var listenRDGroupWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerRD(widget));
    	};


	var listenDebitGroupWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerDebitCard(widget));
    	};


	var listenFundTransferGroupWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerFundTransfer(widget));
    	};
	
	var listenGroupLoansWidget = function (widget) {
    	    Bus.subscribe('DeckTabOpen', getDeckPanelOpenHandlerGroupLoans(widget));
    	};

 
	/*PL Loan end*/


	
	/**
	*Setup the LauncherDeckRefreshContent Module and its function
	*/
    exports.LauncherDeckRefreshContent = {
        setup: function (localBus,modInitialize) {
		Bus = localBus;
		initialize = modInitialize;
            this.notify = notify;
            this.listen = listen;
            return this;
        },
	setupGroupWidget : function (localBus){
	    Bus = localBus;
            this.notify = notify;
            this.listenGroupWidget = listenGroupWidget;
            return this;
	},
	/* PL Loan start*/
	setupAccountGroupWidget : function (localBus,modInitialize){
	    Bus = localBus;
            this.notifyAccountGrp = notifyAccountGrp;
            this.listenAccountGroupWidget = listenAccountGroupWidget;
	    accountGrpInitialize= modInitialize;
            return this;
	},
	setupFDGroupWidget : function (localBus,modInitialize){
	    Bus = localBus;
            this.notifyAccountGrp = notifyAccountGrp;
            this.listenFDGroupWidget = listenFDGroupWidget;
	    FDGrpInitialize= modInitialize;
            return this;
	},
	setupRDGroupWidget : function (localBus,modInitialize){
	    Bus = localBus;
            this.notifyAccountGrp = notifyAccountGrp;
            this.listenRDGroupWidget = listenRDGroupWidget;
	    RDGrpInitialize= modInitialize;
            return this;
	},
	setupDebitCardGroupWidget : function (localBus,modInitialize){
	    Bus = localBus;
            this.notifyAccountGrp = notifyAccountGrp;
            this.listenDebitGroupWidget = listenDebitGroupWidget ;
	    debitInitialize= modInitialize;
            return this;
	},
	setupFundTransferGroupWidget : function (localBus,modInitialize){
	    Bus = localBus;
            this.notifyAccountGrp = notifyAccountGrp;
            this.listenFundTransferGroupWidget = listenFundTransferGroupWidget ;
	    fundTransferGrpInitialize= modInitialize;
            return this;
	},
	setupGroupLoansWidget : function (localBus,modInitialize){
	    Bus = localBus;
            this.notifyAccountGrp = notifyAccountGrp;
            this.listenGroupLoansWidget = listenGroupLoansWidget ;
	    groupLoansInitialize= modInitialize;
            return this;
	},

	/*PL Loan End*/
	setupBillpay: function (localBus,modInitialize) {
            Bus = localBus;
	    grpInitialize = modInitialize;
            this.notifyBillPay = notifyBillPay;
            this.listenBillPay = listenBillPay;
            return this;
        }
    };
});
