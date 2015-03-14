GriQuire JS library
===================

Simple and intuitive library for loading JS files asynchronously, but execute them one by one.
RequireJS style, but much simpler.

```
<!-- load the library -->
<script src="griquire/griquire.js"></script>

<!-- load all the other libraries -->
<script>
griquire([
	// external libs
	'lib/jquery.min.js',
	'lib/bootstrap.min.js',

	// my libs
	'app/my_lib.js'
], function() {
	// at this point all the scripts above are loaded (one by one)
	// 
	// your code goes here...
});
</script>
```

