QUnit.log( function (context) {
    if (window.console && window.console.log && context.message) {
        window.console.log(context.result + ' :: ' + context.message  );
    }
});