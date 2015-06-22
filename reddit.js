var request = require("request");
var cheerio = require('cheerio');
var fs = require('fs');	
var target_url = "http://www.reddit.com/r/pics/";
var next_page = [];
var jar = request.jar();
var images = [];
var i = 0;
var directory = "testing/";

var cookie = request.cookie("over18=1");
cookie.domain = "reddit.com";
cookie.path = "/";

jar.setCookie(cookie, target_url, function(error, cookie) {
    console.log(error);
    console.log(cookie);
});


var scrape = function(target){

request({
	
    uri: target,
    method: "GET",
    jar: jar
}, function(error, response, body) {
   
    if (!error) {
    	$ = cheerio.load(body);
    
    
	//Code block to traverse paginations

	$("span.nextprev a").each(function(index, nextprev){
		if ($(nextprev).attr('rel') == "nofollow next") {
			console.log("Scraping next");
			var next = $(nextprev).attr('href')
			console.log(next);
			next_page.push(next);
			console.log(next_page);
			scrape(next);
			// scrape($(nextprev).attr('href'));
		};
		
	});


	$('a.title').each(function(index, links){
		var URL = $(links).attr("href");
		// console.log(URL);
		if (URL.indexOf("i.imgur.com")!= "-1") {
			console.log(URL);
			if (URL.indexOf(".jpg")!= "-1") {
				var filename = Math.floor((Math.random() * 1000000) + 1)+".jpg";
			}else if (URL.indexOf(".png")!= "-1") {
				var filename = Math.floor((Math.random() * 1000000) + 1)+".png";	
			}else if (URL.indexOf(".jpeg")!= "-1") {
				var filename = Math.floor((Math.random() * 1000000) + 1)+".jpeg";	
			}else if (URL.indexOf(".gif")!= "-1") {
				var filename = Math.floor((Math.random() * 1000000) + 1)+".gif";	
			}

			download(URL, directory+filename, function(){
				console.log("Done");
				i++;
				console.log(i);
			});
		}else if(URL.indexOf("gfycat.com")!= "-1"){
			findVideoLink(URL);
		}else if (URL.indexOf("imgur.com")==7) {
			scrape_imgurl(URL);
		};
	});

};
}).on("error", function(err){
	console.log(err);
	console.log("RETRYING");
    var retry = next_page[(next_page.length)-1];
    scrape(retry);
});

}

//Code to download a file and save it to Hard Disk

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    // request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
-
	request
	  .get(uri)
	  .on('error', function(err) {
	    console.log(err)
	  })
	  .pipe(fs.createWriteStream(filename)).on('close', callback);


  });
};



//Function to scrape image from imgurl.com

var scrape_imgurl = function(target_imgurl){
	var link;
	console.log("TARGET URL"+target_imgurl);
	request(target_imgurl, function(err, res, body){
		if (!err) {
			$ = cheerio.load(body);
			$(".image img").each(function(index, image){
				link = $(image).attr("src");
				console.log("FOUND IMAGE LINK "+link);
				if (link.indexOf('i.imgur.com')!= "-1") {

						if (link.indexOf(".jpg")!= "-1") {
							var filename = Math.floor((Math.random() * 1000000) + 1)+".jpg";
						}else if (link.indexOf(".png")!= "-1") {
							var filename = Math.floor((Math.random() * 1000000) + 1)+".png";	
						}else if (link.indexOf(".jpeg")!= "-1") {
							var filename = Math.floor((Math.random() * 1000000) + 1)+".jpeg";	
						}else if (link.indexOf(".gif")!= "-1") {
							var filename = Math.floor((Math.random() * 1000000) + 1)+".gif";	
						}

						console.log("DOWNLOADING "+link);
						download("http:"+link, directory+filename, function(){
							console.log("Done From album");
						});
					}
				});
		};
	});
	

}


var findVideoLink = function(target_gyf){
	var link
	request(target_gyf, function(err, res, body){
		if (!err) {
		$ = cheerio.load(body);
		link = "http:"+$('#mp4source').attr("src");
		// link = link.replace("//", "http://www.");
		console.log(link);
		var filename = Math.floor((Math.random() * 1000000) + 1)+".mp4";
		download(link, directory+filename, function(){
			console.log("Done mp4");
		})
	};
	});
	
}






scrape(target_url);