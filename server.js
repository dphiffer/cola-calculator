const path = require("path");
const fastify = require("fastify")({
	logger: false
});

fastify.register(require("fastify-static"), {
	root: path.join(__dirname, "public")
});

fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log(`Listening on ${address}`);
	fastify.log.info(`Listening on ${address}`);
});
