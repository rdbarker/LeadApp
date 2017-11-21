function generatePdf(rates,recs){
var doc = new PDFDocument({
  layout: 'landscape',
  margin: 0
});
function arc(x, y, radius, startAngle, endAngle, anticlockwise){
  var startX = x + radius * Math.cos(startAngle);
  var startY = y + radius * Math.sin(startAngle);
  var endX = x + radius * Math.cos(endAngle);
  var endY = y + radius * Math.sin(endAngle);
  var arcAngle = endAngle-startAngle;
  var largeArc = (arcAngle > Math.PI) ^ (startAngle > endAngle) ^ anticlockwise;
  var path =
      "M "+startX+","+startY+
      " A "+radius+","+radius+
      " 0 "+(largeArc?"1":"0")+","+(anticlockwise?"0":"1")+
      " "+endX+","+endY;
  return path;
}
var stream = doc.pipe(blobStream());
var iframe = document.querySelector('iframe');
var gray = "gray"; var green = "#4CAF50"; var lightGray = "#eaeaea"; var black = "#262626"; white = "white"; darkGreen = "#388E3C"; darkBlue = "#1976D2"
var grad = ["#8BC34A","#CDDC39","#FFEB3B","#FFC107","#FF9800"]
function grabColor(percent){
  if (percent<0.2){return grad[4]}
  else if (percent<0.35){return grad[3]}
  else if (percent<0.5){return grad[2]}
  else if (percent<0.75){return grad[1]}
  else {return grad[0]}
}
var files = {
  font: {
    url: 'https://cdn2.hubspot.net/hubfs/431273/LeadApp_Assets/Oswald-Regular.ttf',
  },
  logo: {
    url: 'https://cdn2.hubspot.net/hubfs/431273/Blog_and_Social_Images/social-suggested-images/nrmg_rss_web_logo_small1.png',
  }
};
var filesLoaded = 0;
function loadedFile(xhr) {
  for (var file in files) {
    if (files[file].url === xhr.responseURL) {
      files[file].data = xhr.response;
    }
  }
  filesLoaded += 1;
  if (filesLoaded == Object.keys(files).length) {
    showPDF();
  }
}
for (var file in files) {
  files[file].xhr = new XMLHttpRequest();
  files[file].xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      loadedFile(this);
    }
  };
  files[file].xhr.responseType = 'arraybuffer';
  files[file].xhr.open('GET', files[file].url);
  files[file].xhr.send(null);
}
function showPDF(){

  function progressArc(x,y,r,lw,percent,subtext){
    doc.lineWidth(lw)
    doc.circle(x,y,r)
       .stroke(gray)
    var t = -90+(360*percent)
    var w = y - (r*.7)
    doc.fontSize(r)
       .font("Oswald")
       .fill(black)
       .text(String(percent*100),x-r-2,w,{
         width: r*2,
         align: "center"
       })
    doc.lineCap("round")
       .lineWidth(lw+1)
       .path(arc(x,y,r,-90*Math.PI/180, t*Math.PI/180, false))
       .stroke(grabColor(percent))
    doc.fontSize(r/2)
       .font("Oswald")
       .text(subtext,x-r,y+r,{
         width: r*2,
         align: "center"
    })
    doc.fontSize(12)
    .font("Oswald")
    .fill(gray)
    .text("%",x+(r/2),y-(r/2))

  }
  function progressBar(x,y,w,h,r,percent,subtext){
    l = w*percent
    pl = x+l-22
    if (l<12){l=14}
    if (pl<x){pl=x+2}
    doc.fontSize(16)
       .font("Oswald")
       .fill(black)
       .text(subtext,x,y)
    doc.roundedRect(x,y+26,w,h,r)
       .fill(gray)
    doc.roundedRect(x,y+26,l,h,r)
       .fill(grabColor(percent))
    doc.fontSize(10)
       .fill(white)
       .text(String(percent*100)+"%",pl,y+h+13)

  }
function drawMonth(x,y,w,month,monthNo){
    var h = 22; var hSize = 18; tSize=18;
    var hX = .5* w + 4
    var tY = y-5
    doc.rect(x,y,w,h)
       .fill(gray)

    doc.rect(x,y+h+tSize,w,tSize)
       .rect(x,y+h+tSize+tSize+tSize,w,tSize)
       .fill(lightGray)

    doc.fontSize(hSize)
       .font("Oswald")
       .fill("white")
       .text("Month "+String(monthNo),x,y-4,{
         width: w,
         align: "center"
       })
    doc.fontSize(tSize)
       .font("Oswald")
       .fill(black)
       .text("Traffic",x,tY+h)
       .text("Contacts",x,tY+h+tSize)
       .text("Leads",x,tY+h+tSize+tSize)
       .text("Customers",x,tY+h+tSize+tSize+tSize)
       .text(String(month[0][1]),x+hX,tY+h)
       .text(String(month[1][1]),x+hX,tY+h+tSize)
       .text(String(month[2][1]),x+hX,tY+h+tSize+tSize)
       .text(String(month[3][1]),x+hX,tY+h+tSize+tSize+tSize)
  }
function drawMonths(x,y,w,h,months){
  var spacing = 6;
  var count = 1;
  for (var vert=0; vert<4;vert++){
    for (var hor=0; hor<3;hor++){
      mX = x + (w*hor)+ (spacing*hor)
      mY = y + (h*vert)+ (spacing*vert)
      drawMonth(mX,mY,w,months[count-1],count)
      count++;
    }
  }
}
function drawHeader(x,y,w,size,headerText){
  doc.rect(x,y,w,size+(size*.3))
     .fill(darkBlue)
  doc.fontSize(size)
     .font("Oswald")
     .fill(white)
     .text(headerText,x+16,y-(size/8))
}

function drawRightHeader(x,y,w,size,h,headerText){
  doc.rect(x+4,y+size,w,h)
     .fill(lightGray)
  doc.rect(x-3,y,w,size+(size*.3))
     .fill(darkBlue)
  doc.fontSize(size)
     .font("Oswald")
     .fill(white)
     .text(headerText,x,y-(size/8))

}
function drawRecs(x,y,size,n){
  var spacing = 6
  for (var i=0; i<n; i++){
    if (recs[i]!=undefined){
      nY = y+spacing+size*i*2.6
      doc.fontSize(size)
         .font("Oswald")
         .fill(black)
         .text(recs[i],x,nY,{
           lineGap: -4,
           indent: 6
         })
      doc.rect(x-4,nY+9,8,4)
         .fill(gray)
    }
  }
}
function drawCopy(x,y,size,w){
  var copy = "Lorem ipsum dolor sit amet, ex duo assum platonem. Ei inermis inimicus pro. Est ne omnes denique tincidunt. Ad summo copiosae deserunt vis. Enim vituperatoribus nam ad, tibique facilisi expetendis nec id, quaeque instructior consequuntur et pri."
  doc.fill(black)
     .font("Oswald")
     .fontSize(size)
     .text(copy,x,y,{
       width:w,
       lineGap: -4,
       indent: 18
     })
}
function drawCta(x,y,w,size,subtext){
  doc.roundedRect(x,y,w,size*2,4)
     .fill(green)
     .link(x,y,w,size*2,"https://www.nrmedia.biz/exploratory")
  doc.roundedRect(x,y+size*2-4,w,4,4)
     .fill(darkGreen)
  doc.font("Oswald")
     .fill(white)
     .fontSize(size)
     .text(subtext,x,y+2,{
       width: w,
       align: 'center'
     })
  
}
function drawEmail(x,y){
  doc.font("Oswald")
     .fontSize(18)
     .fill(black)
     .text("Get in touch with us, email Nate:",x,y,{
       width: 248,
       align: 'center'
     })
     .text("Nate@nrmedia.biz",{
       width: 248,
       align: 'center',
       link: "mailto:nate@nrmedia.biz",
       underline: true
     })
     
}
doc.registerFont("Oswald",files.font.data)

drawHeader(0,6,262,32,"Marketing Evaluation")
drawCopy(14,54,16,510)
drawRightHeader(530,6,270,24,294,"How You Stack Up")
progressArc(590,100,40,10,rates["score"],"Overall")
progressBar(650,40,130,10,4,rates["webScore"],"Website")
progressBar(650,80,130,10,4,rates["conScore"],"Content")
progressBar(650,120,130,10,4,rates["socScore"],"Social Media")
drawHeader(532,180,124,18,"Start Improving")
drawRecs(540,200,14,3)
drawRightHeader(530,335,270,24,140,"Grow With Us")
drawCta(540,374,248,16,"Click Here To Schedule An Exploratory")
drawEmail(540,420)
drawHeader(0,130,226,24,"Your 12 Month Baseline")
drawMonths(16,164,160,104,rates["months"])
doc.image(files.logo.data,625,515, {width: 150})
// end and display the document in the iframe to the right
doc.end();

function saveData (blob,filename) {
      
      var url = window.URL.createObjectURL(blob);
      dl = $("#lc-downloadbutton")
      dl.attr("href",url)
      dl.attr("download",filename)
      $("#lc-loading").hide()
      dl.show()
  
}
stream.on('finish', function() {
  var blob = stream.toBlob('application/pdf');
  saveData(blob,"marketing_eval_nrmedia.pdf")
});
}
}
