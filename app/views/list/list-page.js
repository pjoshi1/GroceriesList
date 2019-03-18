var dialogsModule = require("tns-core-modules/ui/dialogs");
var observableModule = require("tns-core-modules/data/observable")
var ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var page;
var GroceryListViewModel = require("../shared/view-models/grocery-list-view-model");

var groceryList = new GroceryListViewModel([]);
var pageData = new observableModule.fromObject({
    groceryList: groceryList,
    grocery: "",
    isLoading = false,
    listLoaded: false
});

exports.loaded = function (args) {
    page = args.object;
    page.bindingContext = pageData;

    groceryList.empty();
    pageData.set("isLoading", true);
    groceryList.load().then(function () {
        pageData.set("isLoading", false);
        pageData.set("listLoaded", true);
    });
};

exports.add = function () {
    // Check for empty submissions
    if (pageData.get("grocery").trim() === "") {
        dialogsModule.alert({
            message: "Enter a grocery item",
            okButtonText: "OK"
        });
        return;
    }

    // Dismiss the keyboard
    page.getViewById("grocery").dismissSoftInput();
    groceryList.add(pageData.get("grocery"))
        .catch(function () {
            dialogsModule.alert({
                message: "An error occurred while adding an item to your list.",
                okButtonText: "OK"
            });
        });

    // Empty the input field
    pageData.set("grocery", "");
};

exports.onSwipeCellStarted = function (args) {
    var swipeLimits = args.data.swipeLimits;
    var swipeView = args.object;
    var rightItem = swipeView.getViewById('delete-view');
    swipeLimits.right = rightItem.getMeasuredWidth();
    swipeLimits.left = 0;
    swipeLimits.threshold = rightItem.getMeasuredWidth() / 2;
};

exports.delete = function (args) {
    var item = args.view.bindingContext;
    var index = groceryList.indexOf(item);
    groceryList.delete(index);
};

