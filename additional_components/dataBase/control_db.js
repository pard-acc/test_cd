var MongoClient = require( 'mongodb' ).MongoClient;
// Connect to the db
exports.OpenDB = function( callback) {
	MongoClient.connect( "mongodb://localhost:27017/dev", function ( err, db ) {
	if ( err ) {
		callback && callback( err );
	}
	 callback && callback(null, db); 
	//db.close(); //關閉連線
	});
}

exports.InsertData = function( db, tableName, message, callback ) {
	try {
		db.collection( tableName, function( err, collection ) {
                    var dataJSON = JSON.parse(message);
			collection.insert( dataJSON );
			collection.count( function( err, count ) {
				if ( err ) throw err;
				console.log( dataJSON+"   :  "+tableName + ' : Total Rows : ' + count);
			});
		});
	}
	catch ( err ) {
		callback( err );
	}
};

exports.QueryData = function( db, tableName, searchItem, callback ) {
	console.log( "db "+db);
	try {
		db.collection( tableName, function( err, collection ) {
			collection.find( searchItem ).sort({ Time : -1 }).toArray( function( err, items ) {
					if( err ) throw err;
					//console.log("We found " + items.length + " results!");
					callback && callback(null, items); 
			});
		});
	}
	catch ( err ) {
		callback( err );
	}
};
