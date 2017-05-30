var LEIHAUOLI = LEIHAUOLI || {};
    LEIHAUOLI.CODE = {};

LEIHAUOLI.CODE.TAB_CONTROL = {
  init: function(){
    this.setParameter();
    this.bindEvent();
  },
  setParameter: function(){
    this.$container = $('.dress-limit-container-wrap');
    this.$tab = $('.dress-limit-tab li');
  },
  bindEvent: function(){
    var self = this;
    this.$tab.on('click',function(e){
      e.preventDefault();
      self.changeTab($(this));
    });
  },
  changeTab: function($target){
    if(this.$container[$target.index()]== undefined){
      return;
    }
    this.$tab.removeClass('selected');
    $target.addClass('selected');
    this.$container.removeClass('selected');
    $(this.$container[$target.index()]).addClass('selected');
  }
};
LEIHAUOLI.CODE.CASSETTE_CONTROL = {
  NUM_OF_DRESS_PER_PAGE: 20,
  load: function(){
    $.ajax({
      type:'GET',
      url:'js/json/product.json',
      dataType:'json',
      success:$.proxy(this.init,this)
    });
    return this;
  },
  init: function(data){
    this.setParameter(data);
    this.createCassettes();
    this.bindEvent();
  },
  setParameter: function(data){
    this.data = data;
    this.$dressContainer = $('.dress-img-display');
    this.$dressTemplate  = this.$dressContainer.find('li').detach();
    this.fragment = document.createDocumentFragment();
    this.$dressTotalNum = $('.dress-limit-result_num');
    this.$searchBtn_1 = $('.tab-1');
    this.$searchBtn_2 = $('.tab-2');
    this.countTotal = 0;
    this.pageControler = LEIHAUOLI.CODE.PAGINATION_CONTROL.init(this);
  },
  bindEvent: function(){
    var self = this;
    this.$searchBtn_1.on('click', function(e){
      e.preventDefault();
      self.collectSelectedVal($(this));
    });
    this.$searchBtn_2.on('click', function(e){
      e.preventDefault();
      self.collectSelectedVal($(this));
    });
  },
  collectSelectedVal: function($target){
    var self = this;
    this.colorCondition = [];
    this.sizeCondition = [];
    this.sceneCondition = [];
    $('input[name=color]:checked').each(function(){
      self.colorCondition.push(parseInt($(this).val()));
    });
    $('input[name=size]:checked').each(function(){
      self.sizeCondition.push($(this).val());
    });
    $('input[name=scene]:checked').each(function(){
      self.sceneCondition = parseInt($(this).val());
    });
    if($target.hasClass('tab-1')){
      this.seachByColorSize();
    }
    if($target.hasClass('tab-2')){
      this.searchByScene();
    }
  },
  seachByColorSize: function(){
    this.indexDressAry = [];
    if(this.colorCondition.length == 0){
      this.colorCondition = [1,2,3,4];
    }
    if(this.sizeCondition.length == 0){
      this.sizeCondition = ['S','M','L'];
    }
    for(var i=0, len_i=this.data.length; i<len_i; i++){
      if(this.colorCondition.indexOf(this.data[i].dress_colorsystem) > -1 && this.sizeCondition.indexOf(this.data[i].dress_size) > -1){
        this.indexDressAry.push(i);
      }
    }
    //this.pageControler.createPageItem(Math.ceil(this.indexDressAry.length/this.NUM_OF_DRESS_PER_PAGE));
    this.controlCassetteDisplay(this.indexDressAry);
  },
  searchByScene: function(){
    this.indexDressAry = [];
    for(var i=0, len_i=this.data.length; i<len_i; i++){
      var lenOfDressScene = this.data[i].special_parent_id;
      for(var k=0, len_k=lenOfDressScene.length; k<len_k; k++){
        if(this.data[i].special_parent_id[k] == this.sceneCondition){
          this.indexDressAry.push(i);
        }
      }
    }
    //this.pageControler.createPageItem(Math.ceil(this.indexDressAry.length/this.NUM_OF_DRESS_PER_PAGE));
    this.controlCassetteDisplay(this.indexDressAry);
  },
  createCassettes: function(){
    for(var j=0, len_j=this.data.length; j<len_j; j++){
      this.dressImgSrc = this.data[j].image_url_top;
      this.dressRentPrice = this.data[j].rent_price;
      this.dressSize = this.data[j].dress_size;
      this.$dressLi = this.$dressTemplate.clone();
      this.fragment.appendChild(this.$dressLi.get(0));
      this.countTotal++;
      this.setDressDetail();
      if(j >= this.NUM_OF_DRESS_PER_PAGE){
        this.$dressLi.hide();
      }
    }
    this.$dressTotalNum.text(this.countTotal);
    this.$dressContainer.get(0).appendChild(this.fragment);
  },
  setDressDetail: function(){
    var priceWithComma = this.dressRentPrice.toLocaleString();
    this.$dressLi.find('img').attr('src',this.dressImgSrc);
    this.$dressLi.find('.dress-rental-price').text('￥'+priceWithComma+'(税込)');
    this.$dressLi.find('.dress-size').text(this.dressSize);
  },
  controlCassetteDisplay: function(selectedAry){
    this.countTotal = 0;
    this.$dressContainer.find('li').hide();
    for(var i=0, len_i= selectedAry.length; i<len_i; i++){
      if(i > this.NUM_OF_DRESS_PER_PAGE){
        this.$dressContainer.find('li').eq(selectedAry[i]).show();
      }
      this.countTotal++;
    }
    this.$dressTotalNum.text(this.countTotal);
  }
};

LEIHAUOLI.CODE.PAGINATION_CONTROL = {
  NUM_OF_DRESS_PER_PAGE: 20,
  init: function(){
    this.setParameter();
    this.bindEvent();
    return this;
  },
  setParameter: function(){
    this.$paginationWrap = $('.jsc-pagination');
    this.$dressContainer = $('.dress-img-display');
    this.$pageTemplate = this.$paginationWrap.find('a').detach();
    this.fragment = document.createDocumentFragment();
    this.$arrowL = $('.jsc-previous');
    this.$arrowR = $('.jsc-next');
    this.countPage = 0;
  },
  createPageItem: function(totalPageNum){
    this.totalPageNum = totalPageNum;
    if(this.totalPageNum<2){
      $('.dress-pagination').remove();
    }
    for(var j=0; j<this.totalPageNum; j++){
      this.$pageItem = this.$pageTemplate.clone();
      this.$pageItem.html(j+1);
      this.fragment.appendChild(this.$pageItem.get(0));
    }
    this.$paginationWrap.get(0).appendChild(this.fragment);
    this.$paginationWrap.find('a').removeClass('selected');
    this.$paginationWrap.find('a:first-child').addClass('selected');
  },
  bindEvent: function(){
    this.displayPage();
    var self = this;
    self.$arrowL.on('click',function(e){
      e.preventDefault();
      self.goToPrev();
    });
    self.$arrowR.on('click',function(e){
      e.preventDefault();
      self.goToNext();
    });
    self.$paginationWrap.find('a').on('click',function(e){
      e.preventDefault();
      self.countPage = parseInt($(this).html())-1;
      console.log(self.countPage);
      self.changePage();
    });
  },
  goToPrev: function(){
    this.countPage--;
    this.changePage();
  },
  goToNext: function(){
    this.countPage++;
    this.changePage();
  },
  changePage: function(){
    var $body      = $('body'),
        $dressWrap = $('.dress-wrap');
    if($body.is(':animated')){
      return;
    }
    $body.animate({scrollTop:$dressWrap.offset().top});
    this.$paginationWrap.find('a').removeClass('selected');
    this.$paginationWrap.find('a').eq(this.countPage).addClass('selected');
    this.$dressContainer.find('li').addClass('none');

    this.controlArrow();
    this.displayPage();
  },
  displayPage: function(){
    var startNum = this.NUM_OF_DRESS_PER_PAGE*this.countPage;
    for(var j=startNum,len=startNum+this.NUM_OF_DRESS_PER_PAGE;j<len;j++){
      var $targetLi = this.$dressContainer.find('li')[j];
      $($targetLi).show();
    }
  },
  controlArrow: function(){
    if((this.countPage+1) == this.totalPageNum){
      this.$arrowR.addClass('none');
    }else{
      this.$arrowR.removeClass('none');
    }
    if((this.countPage+1) > 1){
      this.$arrowL.removeClass('none');
    }else{
      this.$arrowL.addClass('none');
    }
  }
};
LEIHAUOLI.CODE.CAROUSEL = {
  ANIMATION_TIMER: 500,

  init: function(){
    this.setParameter();
    this.createIndicators();
    this.bindEvent();
  },
  setParameter: function(){
    this.$container   = $('.special-carousel-imgs');
    this.$displayArea = $('.special-carousel-display');
    this.$imgs        = this.$container.find('li');
    this.oneImgWidth  = this.$imgs.outerWidth();
    this.displayAreaWidth = this.$displayArea.width();
    this.$arrowL      = $('.arrowL');
    this.$arrowR      = $('.arrowR');
    this.numOfImgsInDisplayArea = Math.floor(this.displayAreaWidth/this.$imgs.width());
    this.numOfMovableWrap       = Math.ceil(this.$imgs.length/this.numOfImgsInDisplayArea);
    this.restImg      = this.$imgs.length % this.numOfImgsInDisplayArea;
    this.$indicatorContainer    = $('.carousel-indicator-wrap');
    this.$template    = this.$indicatorContainer.children('li').detach();
    this.fragment     = document.createDocumentFragment();
    this.countIndex   = 0;
  },
  bindEvent: function(){
    var self = this;
    $('.carousel-indicator').on('click',function(){
      self.selectIndicator($(this));
    });
    this.$arrowR.on('click',function(e){
      e.preventDefault();
      self.slideRight();
    });
    this.$arrowL.on('click',function(e){
      e.preventDefault();
      self.slideLeft();
    });
  },
  slideImages: function(){
    if(this.countIndex == (this.numOfMovableWrap-1)){
      this.$container.animate({left:-(this.displayAreaWidth*(this.countIndex-1)+this.oneImgWidth*this.restImg)},this.ANIMATION_TIMER);
    }else{
      this.$container.animate({left:-this.displayAreaWidth*this.countIndex},this.ANIMATION_TIMER);
    }
    this.controlIndicator();
    this.controlArrow();
  },
  slideRight: function(){
    if(this.$container.is(':animated')){
      return;
    }
    this.countIndex++;
    this.slideImages();
  },
  slideLeft: function(){
    if(this.$container.is(':animated')){
      return;
    }
    this.countIndex--;
    this.slideImages();

  },
  selectIndicator: function($target){
    if(this.$container.is(':animated')){
      return;
    }
    this.countIndex = $target.index();
    this.slideImages();
  },
  controlArrow: function(){
    if(this.countIndex == this.numOfMovableWrap-1){
      this.$arrowR.addClass('none');
    }else{
      this.$arrowR.removeClass('none');
    }

    if(this.countIndex == 0){
      this.$arrowL.addClass('none');
    }else{
      this.$arrowL.removeClass('none');
    }
  },
  createIndicators: function(){
    for(var i=0; i<this.numOfImgsInDisplayArea; i++){
      var $indicator = this.$template.clone();
      if(i == 0){
        $indicator.addClass('carousel-indicator-selected');
      }
      this.fragment.appendChild($indicator.get(0));
    }
    this.$indicatorContainer.get(0).appendChild(this.fragment);
  },
  controlIndicator: function(){
    this.$indicatorContainer.find('li').removeClass('carousel-indicator-selected');
    this.$indicatorContainer.find('li').eq(this.countIndex).addClass('carousel-indicator-selected');
  }
};

LEIHAUOLI.CODE.TO_DETAIL_PAGE = {
  init: function(){
    this.setParameter();
    this.bindEvent();
  },
  setParameter: function(){
    this.$dressLi = $('.dress-img-display');
  },
  bindEvent: function(){
    var self = this;
    this.$dressLi.on('click',function(){
      self.setPath($(this));
    });
  },
  setPath: function($target){
    console.log($target);

  }
};
$(function(){
  LEIHAUOLI.CODE.CAROUSEL.init();
  LEIHAUOLI.CODE.CASSETTE_CONTROL.load();
  LEIHAUOLI.CODE.TAB_CONTROL.init();
  //LEIHAUOLI.CODE.SEARCH_CONTROL.init();
  //LEIHAUOLI.CODE.TO_DETAIL_PAGE.init();
});
