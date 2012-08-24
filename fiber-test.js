if (Meteor.is_client) {
  Template.hello.greeting = function () {
    return "Welcome to fiber-test.";
  };

  Template.hello.events = {
    'click input' : function () {
      var message = "You pressed the button and we ran an async job in a fiber just for fun!";

      Meteor.call('parallelAsyncJob', message, function(err, result) {
        if (typeof console !== 'undefined')
          console.log(message);
      });
    }
  };
}

if (Meteor.is_server) {

  Meteor.methods({
    parallelAsyncJob: function(message) {

      // We're going to make http get calls to each url
      var urls = ['http://google.com', 'http://news.ycombinator.com'];

      // Keep track of each job in an array
      var futures = _.map(urls, function(url) {

        // Setup a furture for the current job
        var future = new Future();

        // A callback so the job signal completion
        var onComplete = future.resolver();

        /// Make async http call
        Meteor.http.get(url, function(error, result) {

          // Do whatever you need with the results here!
          
          // Inform the future that we're done with it
          onComplete(error, result);
        });

        // Return the future
        return future;
      });

      Future.wait(futures);
    }
  });

}
