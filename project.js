//fieldset sliding and progressbar
var currentField, nextField, prevField;
var hiddenFields = [];
var animating = false;
var progressIntervalsNo = $("fieldset").length + 1
var progressPercents = Math.round(1000/progressIntervalsNo) /10
var progress = progressPercents
var intervals = 1
var bar = $("#progress-bar")
bar.css("width",progress+"%")
function addProgress(){
  intervals+=1
  if (intervals==progressIntervalsNo){
    progress = 100
  }
  else{progress += progressPercents}
  bar.css("width",progress+"%")
}
function animateProgress(){
  var bar = $("#progress-bar")

}
$(".lc-next").click(function(){
  if (animating){ return false;}
  animating = true;
  var sub = false;
  if ($(this).hasClass("lc-submit")){
    sub = true
  }
  addProgress()
  currentField = $(this).closest("fieldset")
  nextField = $(this).closest("fieldset").next()
  currentField.fadeOut('fast', function(){
    nextField.fadeIn('fast', function(){
      animating = false;
      if (sub){generate()}
    });
  })
})
//hiding and unhiding of select fields
$(".btn").click(function(){
  currentField = $(this).closest("fieldset")
  if (animating){ return false;}
  animating = true;
  if(currentField.hasClass("lc-require")){
    if ( $(this).hasClass("btn-yes") ){
      addProgress()
      nextField = $(this).closest("fieldset").next()
    }
    else{
      addProgress()
      addProgress()
      nextField = $(this).closest("fieldset").next().next()
    }
  }
  else{
    addProgress()
    nextField = $(this).closest("fieldset").next()
  }
  currentField.fadeOut('fast', function(){
    nextField.fadeIn('fast', function(){
      animating = false;
    });
  });
})
//gen stuff
var finalScore, finalWebScore, finalConScore, finalSocScore;
function generate(){
  //Form Evaluation
  var maxScore = 0, maxWebScore = 0, maxConScore = 0, maxSocScore = 0;
  var score =0, webScore = 0, conScore = 0, socScore = 0;
  var formDoc = document.getElementById("lc-form")
  var formWeights = {
    "lc-webAnt": {"Yes":2, "No":0, "Notsure":0},
    "lc-webMoz": {"Yes":2, "No":0},

    "lc-webMonLeads": {"Yes":2, "No":0, "Notsure":0},
    "lc-webConLeads": {"MoreThan20":3, "11to20":2, "LessThan10":1},

    "lc-conBlog": {"Yes":2, "No":0, "Notsure":0},
    "lc-conPost": {"Daily":3, "Weekly":2, "Monthly":1, "Never":0},
    "lc-conEmail":{"Weekly":2, "Monthly":1, "Notoften":0, "Never":0},
    "lc-conOffers":{"15":3, "6":2, "1":1, "None":0},

    "lc-socFacebook":1,
    "lc-socTwitter":1,
    "lc-socLinkedin":1,
    "lc-socTrack":{"Yes":2, "No":0}
  }
  function findMax(obj){
    var max = 0
    for (var key in obj){
      if (obj[key]>max){
        max = obj[key]
      }
    }
    return max
  }
  //website eval
  for (var formKey in formWeights){
    if (formWeights[formKey]==1){ //facebook etc
      maxScore+=1
      maxSocScore+=1
    }
    else{  //everything else
      maxScore+=findMax(formWeights[formKey])
      //find cat
      var cat = formKey.substring(3, 6)
      if (cat=="web"){maxWebScore+=findMax(formWeights[formKey])}
      else if (cat=="con"){maxConScore+=findMax(formWeights[formKey])}
      else if (cat=="soc"){maxSocScore+=findMax(formWeights[formKey])}
      var val = 0
      val = formWeights[formKey][ formDoc[formKey].value ]
      if (val!=undefined){
        score += val
        if (cat=="web"){webScore+=val}
        else if (cat=="con"){conScore+=val}
        else if (cat=="soc"){socScore+=val}
    }
    }
  }
  finalScore = Math.round(score/maxScore*100)
  finalWebScore = Math.round(webScore/maxWebScore*100)
  finalConScore = Math.round(conScore/maxConScore*100)
  finalSocScore = Math.round(socScore/maxSocScore*100)
  console.log(formDoc["lc-webTraffic"].value)
  //calcRates
  function calcMonths(obj){
    var trafficGrowing = parseInt(traffic)
    months = []
    for (var x = 1; x<13; x++){
      trafficGrowing = trafficGrowing + (Math.round(trafficGrowing*obj["trafficGrowth"]))
      var contactsGrowing = Math.round(obj["vtc"]*trafficGrowing)
      var leadsGrowing = Math.round(obj["ctm"] * contactsGrowing)
      var customersGrowing = Math.round(obj["mtc"] * leadsGrowing)
      objTemp = [
                ["Traffic",trafficGrowing],
                ["Contacts",contactsGrowing],
                ["Leads",leadsGrowing],
                ["Customers",customersGrowing]]
      months.push(objTemp)
    }
      console.log(JSON.stringify(months))
      return months

  }
  function genRecs(){
    var recNum = 2; var recs = []
    // start a blog
    if (formDoc["lc-conBlog"].value=="No"){recs.push("Start a blog, and start writing great content for it!")}
    //create more content offers
    if (formDoc["lc-conOffers"].value=="1"){recs.push("Start getting active on Social Media!")}
    //create more blog posts
    if (formDoc["lc-conPost"].value=="Monthly"||formDoc["lc-conPost"]=="Never"){recs.push("Try writing great content on your blog more often!")}
    //start using web ants
    if (formDoc["lc-webAnt"].value=="No"||formDoc["lc-webAnt"]=="Notsure"){recs.push("Start tracking your web traffic with antalytics software such as Google Antalytics.")}
    return recs
  }

  traffic=formDoc["lc-webTraffic"].value
  var trafficGrowth = 0.025
  var trafficGrowthMax = 0.12
  var vtc = 0.01
  var vtcMax = 0.05
  var ctm = 0.05
  var ctmMax = 0.15
  var mtc = 0.25
  var mtcMax = 0.3
  var scoreDec = finalScore/100
  var rates = {
    "trafficGrowth" : trafficGrowth - ((trafficGrowth - trafficGrowthMax) * scoreDec),
    "vtc" : vtcMax - ((vtcMax - vtc)*(scoreDec)),
    "ctm" : ctmMax - ((ctmMax - ctm)*scoreDec),
    "mtc" : mtcMax - ((mtcMax - mtc)*scoreDec),
    "score": finalScore/100,
    "webScore": finalWebScore/100,
    "conScore": finalConScore/100,
    "socScore": finalSocScore/100
  }
  rates["months"] = calcMonths(rates)
  generatePdf(rates,genRecs())
}
