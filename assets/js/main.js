String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

/*
  refer "string insert" from http://stackoverflow.com/questions/4313841/javascript-how-can-i-insert-a-string-at-a-specific-index
*/

function modalTrigger(imgpath) {
  var modal = document.getElementById('walkthrough_list_modal');
  var modalImg = document.getElementById("modal_image");
  modal.style.display = "block";
  modalImg.src = imgpath;
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
  refer "query value" from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
*/

function exportOptionToSelect(target, values, level) {
  // remove first
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
  // then add
  if(level === 1){
    var option = document.createElement("option");
    option.value = '請選擇副本';
    option.text = '請選擇副本';
    target.appendChild(option);
  }else{
    var option = document.createElement("option");
    option.value = '請選擇關卡';
    option.text = '請選擇關卡';
    target.appendChild(option);
  }
  for (var i in values) {
    var option = document.createElement("option");
    option.value = values[i].name;
    option.text = values[i].name;
    target.appendChild(option);
  }
}
/*
  refer "clear option" from https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
  refer "add option" from https://stackoverflow.com/questions/17001961/javascript-add-select-programmatically
*/


var walkthrough_base = {
  fetch_url: 'https://spreadsheets.google.com/feeds/list/1LxS-3KjkpjQGzS4TDfy09bNOC2KA5jf6gBp97Q_bCJ0/3/public/values?alt=json',
  query_url: 'https://script.google.com/macros/s/AKfycbyYj5lLtXz3t_NfIZs8yML0Wz5Ko5bUZSVSDVgqNawYSNDa7W4/exec',
  events_list: events_list
};

var walkthrough_data = {
  source: [],
  filted: [],
  stage_img_filename: {},
  type_badge_css: {
    'sub全解': 'badge_orange',
    '周回(記錄用)': 'badge_blue',
    '全配布': 'badge_green'
  },
  filter_event: document.getElementById('walkthrough_filter_event'),
  filter_stage: document.getElementById('walkthrough_filter_stage'),
  sub_all: document.getElementById('walkthrough_filter_cb1'),
  for_record: document.getElementById('walkthrough_filter_cb2'),
  full_given: document.getElementById('walkthrough_filter_cb3'),
  stone_asc: document.getElementById('walkthrough_filter_cb4'),
  walkthrough_list: document.getElementById('walkthrough_list'),
  init: function(){
    exportOptionToSelect(this.filter_event, walkthrough_base.events_list, 1);
    this.filter_event.selectedIndex = 0;
    this.filter_event.addEventListener('change', this.filterChangeByEvent);
    this.filter_stage.selectedIndex = 0;
    this.filter_stage.addEventListener('change', this.filterChange);
    this.sub_all.addEventListener('change', this.filterChange);
    this.for_record.addEventListener('change', this.filterChange);
    this.full_given.addEventListener('change', this.filterChange);
    this.stone_asc.addEventListener('change', this.filterChange);
    this.fetch();
  },
  fetch: function(){
    var r = new XMLHttpRequest();
    r.open("GET", walkthrough_base.fetch_url, true);
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return;
      var data = JSON.parse(r.responseText);
      console.log(data);
      data.feed.entry.forEach(function(row){
        var res = {};
        for(var key in row){
          if(key.indexOf('$') === -1) continue;
          var head = key.replace('gsx$', '');
          res[head] = row[key]['$t'];
          if(head.indexOf('timestamp') !== -1) res[head] = new Date(parseInt(res[head]));
          if(head.indexOf('stone') !== -1) res[head] = parseInt(res[head]);
        }
        walkthrough_data.source.push(res);
        walkthrough_data.filterChange(1);
      });
    };
    r.send();
  },
  getTypeCheckbox: function(){
    var typeList = [];
    if(this.sub_all.checked) typeList.push('sub全解');
    if(this.for_record.checked) typeList.push('周回(記錄用)');
    if(this.full_given.checked) typeList.push('全配布');
    return typeList;
  },
  toggleListen: function(on){
    var btn_list = document.querySelectorAll('.walkthrough_team_detail_btn');
    function detail(event) {
        thisTeam = event.target.parentNode.parentNode;
        thisTeam.classList.toggle('walkthrough_detail_open');
    }
    if(on){
      for (var i = 0; i < btn_list.length; i++) {
        btn_list[i].addEventListener('click', detail);
      }
    }else{
      for (var i = 0; i < btn_list.length; i++) {
        btn_list[i].removeEventListener('click', detail);
      }
    }
  },
  filterChangeByEvent: function(e){
    var selected = walkthrough_data.filter_event.value;
    if(selected === '請選擇副本') {
      exportOptionToSelect(walkthrough_data.filter_stage, [], 2);
    }else{
      var target_event = _.find(walkthrough_base.events_list, { 'name': selected });
      exportOptionToSelect(walkthrough_data.filter_stage, target_event.stages, 2);
    }
    walkthrough_data.filterChange(1);
  },
  filterChange: function(e){
    walkthrough_data.filted = _.filter(walkthrough_data.source, function(o){
      if(walkthrough_data.filter_event.value === '請選擇副本') ;
      else if(o.event.indexOf(walkthrough_data.filter_event.value) === -1) return false;
      if(walkthrough_data.filter_stage.value === '請選擇關卡') ;
      else if(o.stage.indexOf(walkthrough_data.filter_stage.value) === -1) return false;
      var cbs = walkthrough_data.getTypeCheckbox();
      var b = (cbs.length === 0);
      for(var i in cbs){
        if(o.type.indexOf(cbs[i]) !== -1) b = true;
      }
      return b;
    });
    if(walkthrough_data.stone_asc.checked) walkthrough_data.filted = _.orderBy(walkthrough_data.filted, 'stone', 'asc');
    else walkthrough_data.filted = _.orderBy(walkthrough_data.filted, 'timestamp', 'asc');
    walkthrough_data.toggleListen(false);
    while (walkthrough_data.walkthrough_list.firstChild) {
      walkthrough_data.walkthrough_list.removeChild(walkthrough_data.walkthrough_list.firstChild);
    }
    walkthrough_data.filted.forEach(function(team){
      var team_node = document.createElement("div");
      var team_grid = document.createElement("div");
      team_node.className = 'pure-u-1 walkthrough_team';
      team_grid.className = 'pure-g';
      var stage_node = document.createElement("div");
      stage_node.className = 'pure-u-3-5 walkthrough_team_stage';
      var stage_img = document.createElement("img");
      var stage_txt = document.createElement('p');
      stage_txt.appendChild(document.createTextNode(team.event + ' - ' + team.stage));
      stage_txt.appendChild(document.createElement("br"));
      stage_img.src = '';
      var stone_txt = document.createElement('span');
      stone_txt.appendChild(document.createTextNode(team.stone+'石'));
      if(team.stone > 0) stone_txt.style.color = 'red';
      stage_txt.appendChild(stone_txt);
      stage_txt.appendChild(document.createElement("br"));
      team.type.split(',').forEach(function (t){
        var txt = t.trim();
        var tspan = document.createElement('span');
        tspan.className = walkthrough_data.type_badge_css[txt];
        tspan.innerHTML = txt;
        stage_txt.appendChild(tspan);
      });
      stage_node.appendChild(stage_img);
      stage_node.appendChild(stage_txt);
      var image_node = document.createElement('div');
      image_node.className = 'pure-u-2-5 walkthrough_team_image';
      var image_img = document.createElement('img');
      image_img.src = team.image.splice(-4, 0, "m");
      image_img.setAttribute('onclick','modalTrigger("' + team.image + '");');
      image_node.appendChild(image_img);
      var detail_btn_node = document.createElement('div');
      detail_btn_node.className = 'walkthrough_team_detail_btn_bg';
      var detail_btn = document.createElement('button');
      detail_btn.appendChild(document.createTextNode('...'));
      detail_btn.className = 'pure-button walkthrough_team_detail_btn';
      detail_btn_node.appendChild(detail_btn);
      var detail_node = document.createElement('div');
      detail_node.className = 'pure-u-1 walkthrough_team_detail';
      var detail_description_node = document.createElement('div');
      detail_description_node.className = 'pure-u-1 walkthrough_team_description';
      var detail_posttime_node = document.createElement('div');
      detail_posttime_node.className = 'pure-u-1 walkthrough_team_posttime';
      detail_description_node.innerHTML = team.description;
      detail_posttime_node.innerHTML = '<p>投稿時間: ' + team.timestamp.toLocaleDateString("zh-TW") +'</p>';
      detail_node.appendChild(detail_description_node);
      detail_node.appendChild(detail_posttime_node);

      team_grid.appendChild(stage_node);
      team_grid.appendChild(image_node);
      team_grid.appendChild(detail_node);
      team_node.appendChild(team_grid);
      team_node.appendChild(detail_btn_node);
      walkthrough_data.walkthrough_list.appendChild(team_node);
    });
    walkthrough_data.toggleListen(true);
  }
};

var walkthrough_form = {
  form_event: document.getElementById('walkthrough_form_event'),
  form_stage: document.getElementById('walkthrough_form_stage'),
  sub_all: document.getElementById('walkthrough_form_cb1'),
  for_record: document.getElementById('walkthrough_form_cb2'),
  full_given: document.getElementById('walkthrough_form_cb3'),
  form_stone: document.getElementById('walkthrough_form_stone'),
  form_description: document.getElementById('walkthrough_form_description'),
  form_submit: document.getElementById('walkthrough_form_submit'),
  paramNameList: {
    event: 'event',
    stage: 'stage',
    image: 'image',
    type: 'type',
    stone: 'stone',
    description: 'description'
  },
  init: function(){
    this.setupImgUploader();
    exportOptionToSelect(this.form_event, walkthrough_base.events_list, 1);
    this.form_event.selectedIndex = 0;
    this.form_stage.selectedIndex = 0;
    this.form_event.addEventListener('change', this.formChangeByEvent);
    tinymce.init({
      selector: '#walkthrough_form_description',
      language_url: './assets/langs/zh_TW.js',
      plugins: 'link image code',
      setup: function (editor) {
        editor.on('change', function () {
          tinymce.triggerSave();
        });
      }
    });
    this.form_submit.addEventListener('click', this.send);
  },
  getTypeCheckbox: function(){
    var typeList = [];
    if(this.sub_all.checked) typeList.push('sub全解');
    if(this.for_record.checked) typeList.push('周回(記錄用)');
    if(this.full_given.checked) typeList.push('全配布');
    return typeList.join(', ');
  },
  setupImgUploader: function(){
    document.getElementById('walkthrough_form_image').innerHTML = '';
    new Imgur({
      clientid: '7c7f739bfb78a16',
      callback: this.uploadCallback
    });
  },
  deleteImageByHash: function(deleteHash){
    var handler = function(e){
      document.getElementById('delete_image').removeEventListener('click', handler);
      var r = new XMLHttpRequest();
      r.open('DELETE', 'https://api.imgur.com/3/image/' + deleteHash, true);
      //Send the proper header information along with the request
      r.setRequestHeader('Authorization', 'Client-ID ' + '7c7f739bfb78a16');
      r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
        document.querySelector('.dropzone').style.display = 'inline-block';
        document.querySelector('.status').style.display = 'none';
        document.querySelector('.status').innerHTML = '';
        this.setupImgUploader();
      };
      r.send();
    }
    return handler;
  },
  uploadCallback: function (res){
    if(res.success === true){
      imgUrl = res.data.link;
      console.log(res);
      document.querySelector('.dropzone').style.display = 'none';
      document.querySelector('.status').style.display = 'inline-block';
      document.querySelector('.status').innerHTML = '<a id="delete_image" class="form_image_close" href="#"></a>'
        + '<img id="form_image_src" src='+res.data.link+' />';
      document.getElementById('delete_image').addEventListener('click',walkthrough_form.deleteImageByHash(res.data.deletehash));
    }
  },
  formChangeByEvent: function(e){
    var selected = walkthrough_form.form_event.value;
    if(selected === '請選擇副本') {
      exportOptionToSelect(walkthrough_form.form_stage, [], 2);
    }else{
      var target_event = _.find(walkthrough_base.events_list, { 'name': selected });
      exportOptionToSelect(walkthrough_form.form_stage, target_event.stages, 2);
    }
  },
  send: function(){
    var image_src = '';
    if(document.getElementById('form_image_src') !== null) {
      image_src = document.getElementById('form_image_src').src;
    }
    var pushStr = [];
    var paramValList = {
      event: encodeURIComponent(walkthrough_form.form_event.value),
      stage: encodeURIComponent(walkthrough_form.form_stage.value),
      image:  image_src,
      type: encodeURIComponent(walkthrough_form.getTypeCheckbox()),
      stone: encodeURIComponent(walkthrough_form.form_stone.value),
      description: encodeURIComponent(walkthrough_form.form_description.value)
    };

    if(paramValList.image.length === 0 && paramValList.description.length === 0){
      alert('請至少填寫攻略方法或是貼上隊伍截圖');
      return;
    }

    pushStr.push(walkthrough_form.paramNameList.event + '=' + paramValList.event);
    pushStr.push(walkthrough_form.paramNameList.stage + '=' + paramValList.stage);
    pushStr.push(walkthrough_form.paramNameList.image + '=' + paramValList.image);
    pushStr.push(walkthrough_form.paramNameList.type + '=' + paramValList.type);
    pushStr.push(walkthrough_form.paramNameList.stone + '=' + paramValList.stone);
    pushStr.push(walkthrough_form.paramNameList.description + '=' + paramValList.description);
    pushStr.push('node=team');

    var r = new XMLHttpRequest();
    r.open('POST', walkthrough_base.query_url, true);
    //Send the proper header information along with the request
    r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return;
      console.log('Success: ' + r.responseText);
      var response = JSON.parse(r.responseText);
      if(response['result'] === 'success'){
        alert('已送出你的隊伍\n時間戳記: '+response['timestamp']+'\n編輯密碼: '+response['editKey']);
        tinyMCE.activeEditor.setContent('');
        window.location.reload();
      }else{
        alert('出現錯誤，訊息為：' + response['error']);
      }
    };
    r.send(pushStr.join('&'));
  }
};

(function() {
  walkthrough_data.init();
  walkthrough_form.init();
})();
