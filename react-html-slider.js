import React,{Component,createRef} from 'react';
import $ from 'jquery';
import "./index.css";
export default class ReactHTMLSlider extends Component {
  constructor(props){
    super(props);
    this.dom = createRef();
    this.index = 0;
    this.state = {left:0,lastLeft:0,index:0,moving:false,items:[props.items[0]]}
    this.autoSlide();
  }
  autoSlide(){
    if(!this.props.autoSlide || this.props.items.length < 2){return}
    clearInterval(this.autoSlideInterval)
    this.autoSlideInterval = setInterval(()=>{
      if(this.state.moving){
        return
      }
      let width = this.getWidth();
      this.setState({moving:true,left:-width,lastLeft:-width},()=>{
        this.startScroll(1)
      })
    },this.props.autoSlide)
  }
  getItems(){
    let {items} = this.props;
    if(items.length < 2){return items;}
    let index = this.index;
    return [
      items[index - 1 < 0?items.length - 1:index - 1],
      items[index],
      items[index + 1 > items.length - 1?0:index + 1] 
    ];
  }
  componentDidMount(){
    let {items} = this.state;
    if(items.length < 2){return;}
    this.setState({left:-this.getWidth()}) 
  }
  getWidth(){return $(this.dom.current).width()}
  mouseDown(e){
    if(this.state.moving){return}
    if(this.props.items.length < 2){return}
    this.isDown = true;
    let x = e.clientX;
    let width = this.getWidth();
    this.so = {x,left:-width,width};
    this.setState({left:-width,lastLeft:-width,moving:true})
    $(window).bind('mousemove',$.proxy(this.mouseMove,this));
    $(window).bind('mouseup',$.proxy(this.mouseUp,this));
  }
  setIndex(offset){
    this.index += offset;
    if(this.index < 0){this.index = this.props.items.length - 1}
    if(this.index > this.props.items.length - 1){this.index = 0}
  }
  stopScroll(offset){
    this.autoSlide();
    clearInterval(this.interval);
    this.setIndex(offset);
    this.setState({moving:false})
  }
  getSpeed(){
    let {speed} = this.props;
    if(speed > 99){speed = 99} if(speed < 1){speed = 1}
    return {speed:(500 - speed * 5) / 10,step:5};
  }
  startScroll(offset){
    let {speed,step} = this.getSpeed();
    let newLeft = this.state.lastLeft + -offset * this.getWidth();
    let dir = offset * -step;
    this.interval = setInterval(()=>{
      debugger;
      let {left} = this.state;  
      if(dir > 0 && left >= newLeft){this.stopScroll(offset)}
      else if(dir < 0 && left <= newLeft){this.stopScroll(offset)}
      else{this.setState({left:left + dir})}
    },speed)
  }
  mouseMove(e){
    let x = e.clientX;
    let offset = x - this.so.x;
    if(Math.abs(offset) >= this.so.width - 10){return}
    this.setState({left:this.so.left + offset})
  }
  mouseUp(){
    this.isDown = false;
    $(window).unbind('mousemove',this.mouseMove);
    $(window).unbind('mouseup',this.mouseUp);
    let {swipMethod} = this.props;
    let {left,lastLeft} = this.state;
    if(left === lastLeft){
      this.stopScroll(0);
      return 
    }
    let newLeft;
    if(left < lastLeft){newLeft = lastLeft - this.so.width;}
    else if(left > lastLeft){newLeft = lastLeft + this.so.width;}
    if(lastLeft === newLeft){return}
    let offset;
    if(newLeft > lastLeft){offset = -1;}
    else{offset = 1;}
    this.startScroll(offset)
  }
  getArrow(type){
    let {arrow,items} = this.props;
    if(!arrow || items.length < 2){return null}
    let style= {},html,onClick;
    if(type === 'left'){
      style = {left:0};
      html = (
        <svg viewBox="0 0 24 24" role="presentation" style={{width: '1.5rem',height: '1.5rem'}}>
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" style={{fill: 'currentcolor'}}></path>
        </svg>
      );
      onClick = ()=>{
        let width = this.getWidth()
        this.setState({moving:true,left:-width,lastLeft:-width},()=>this.startScroll(-1))
      }
    }
    else {
      style = {right:0};
      html = (
        <svg viewBox="0 0 24 24" role="presentation" style={{width: '1.5rem',height: '1.5rem'}}>
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" style={{fill: 'currentcolor'}}></path>
        </svg>
      );
      onClick = ()=>{
        let width = this.getWidth()
        this.setState({moving:true,left:-width,lastLeft:-width},()=>this.startScroll(1))
      }
    }
    return (
      <div className='rh-slider-arrow' style={style} onClick={onClick}>{html}</div>
    )
  }
  render(){
    let {moving} = this.state;
    let {attrs} = this.props;
    let left,items;
    if(moving){left = this.state.left; items = this.getItems()}
    else{left = 0; items = [this.props.items[this.index]]}
    return (
    <div className='rh-slider' {...attrs} ref={this.dom}>
      <div 
        className='rh-slider-items' style={{left}}
        onMouseDown={this.mouseDown.bind(this)}
        draggable={false}
        onDragStart={(e)=>e.preventDefault()}
      >{items.map((o,i)=><div key={i} className='rh-slider-item'>{o}</div>)}</div>  
      {this.getArrow('left')}
      {this.getArrow('right')}
      
    </div>
    
  );
  }
}
ReactHTMLSlider.defaultProps = {
  items:[],
  speed:90,
  arrow:true,
  autoSlide:3000,
}