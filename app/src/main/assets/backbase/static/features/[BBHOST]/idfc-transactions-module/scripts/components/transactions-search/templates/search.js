define(function(require, exports, module) {
    'use strict';

    module.exports = [
        '<form class="panel-heading" ng-submit="doSearch" ng-class="{ \'has-category-toggle\': showCategories }">',
        '    <div class="lp-search-wrapper">',
        '        <div class="lp-search-left">',
        '            <div lp-tags-filters="lp-tags-filters"></div>',
        '        </div>',
        '        <div class="lp-search-tags">',
        '            <div lp-tags="lp-tags" empty="lp-tags-left" class="lp-tags"></div>',
        '        </div>',
        '        <div class="lp-search-middle">',
        '            <input lp-smartsuggest="lp-smartsuggest"',
        '                   smartsuggest-select="selectSuggestion"',
        '                   smartsuggest-clear="clearSuggestion"',
        '                   smartsuggest-update="updateSuggestion"',
        '                   currency="accounts.selected.currency"',
        '                   contacts="contacts.contacts"',
        '                   categories="transactionsCategories.categories"',
        '                   ng-model="searchTerm"',
        '                   class="form-control" placeholder="Search for dates, amounts, contacts..." />',
        '        </div>',
        '        <div class="lp-search-right">',
        '            <div dropdown-select="dropdown-select" ng-options="option as option for option in sort.options" ng-model="sort.selected" ng-change="changeSort()" class="input-group-btn sort-select pull-right" option-template-url="$transactions/sortDropdownOption.html"',
        '                 aria-controls="transactions-list">',
        '            </div>',
        '        </div>',
        '    </div>',
        '</form>'
    ].join('');
});
