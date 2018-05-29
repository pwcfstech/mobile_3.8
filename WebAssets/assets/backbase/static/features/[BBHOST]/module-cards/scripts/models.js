define(function(require, exports, module) {
    'use strict';

    // @ngInject
    exports.CardsModel = function(lpCoreUtils, $resource) {
        /**
         * Assets service constructor
         * @param config
         * @constructor
         */
        var CardsModel = function(config) {
            var self = this;

            config.cardsEndpoint = lpCoreUtils.resolvePortalPlaceholders(config.cardsEndpoint);
            self.cards = [];
            self.selected = {};

            self.cardsService = $resource(config.cardsEndpoint, {}, {
                update: {method: 'PUT'}
            });
        };


        /**
         * Loads the list of cards from the endpoint
         */
        CardsModel.prototype.load = function() {
            var self = this;

            return self.cardsService.query({}, function(cards) {
                self.cards = cards;
            }).$promise;
        };

        /**
         * Loads the details for a particular card
         * @params cardId
         */
        CardsModel.prototype.loadCardDetails = function(cardId) {
            var self = this;

            return self.cardsService.get({id: cardId}, function(card) {
                self.selected = card;
            }).$promise;
        };

        /**
         * Loads the loyalty details of selected card
         */
        CardsModel.prototype.loadCardLoyaltyDetails = function(cardId) {
            var self = this;

            if(!cardId) {
                cardId = self.selected.id;
            }

            return self.cardsService.get({id: cardId, noun: 'loyalty'}, function(data) {
                self.selected.loyalty = data.loyalty;
            }).$promise;
        };

        /**
         * Finds a particular card by ID
         * @params cardId
         */
        CardsModel.prototype.findById = function(cardId) {
            var self = this;
            var card;

            for(var i = 0; i < self.cards.length; i++) {
                if(self.cards[i].id === cardId) {
                    card = self.cards[i];
                    break;
                }
            }

            return card;
        };



        return {
            getInstance: function(config) {
                return new CardsModel(config);
            }
        };
    };
});
