/* 轻量鱼群动画：在 #aquarium 中生成多只 SVG 鱼，随机路径游动 */
/* 完全不依赖外部库，适合手机与笔电 */

const aquarium = document.getElementById('aquarium');
const FISH_COUNT = 8; // 鱼的数量（可改）
const WIDTH = () => aquarium.clientWidth;
const HEIGHT = () => aquarium.clientHeight;

function makeFishSVG(id, colorA, colorB){
  // 一只简单的 SVG 鱼（可自定义颜色）
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox","0 0 100 50");
  svg.classList.add('fish');
  svg.dataset.id = id;

  const body = document.createElementNS(svgNS,"ellipse");
  body.setAttribute("cx","45"); body.setAttribute("cy","25"); body.setAttribute("rx","30"); body.setAttribute("ry","16");
  body.setAttribute("fill", colorA);
  body.setAttribute("opacity","0.95");
  svg.appendChild(body);

  const tail = document.createElementNS(svgNS,"polygon");
  tail.setAttribute("points","75,25 95,10 95,40");
  tail.setAttribute("fill", colorB);
  tail.setAttribute("opacity","0.95");
  svg.appendChild(tail);

  const eye = document.createElementNS(svgNS,"circle");
  eye.setAttribute("cx","30"); eye.setAttribute("cy","20"); eye.setAttribute("r","3.2");
  eye.setAttribute("fill","#fff");
  svg.appendChild(eye);

  return svg;
}

function rand(min,max){ return Math.random()*(max-min)+min; }

function start(){
  // 清空
  aquarium.innerHTML = '';

  // 背景轻微颗粒与光晕（canvas）
  const canvas = document.createElement('canvas'); canvas.style.position='absolute'; canvas.style.inset=0; canvas.style.zIndex=1;
  aquarium.appendChild(canvas);
  canvas.width = aquarium.clientWidth; canvas.height = aquarium.clientHeight;
  const ctx = canvas.getContext('2d');

  // 渐变光晕
  function drawBG(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const g = ctx.createRadialGradient(canvas.width*0.2, canvas.height*0.2, 10, canvas.width*0.2, canvas.height*0.2, canvas.width*0.9);
    g.addColorStop(0, 'rgba(0,200,255,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // 轻微噪点
    for(let i=0;i<200;i++){
      ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.02})`;
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1,1);
    }
  }
  drawBG();

  // 生成鱼群
  const fishes = [];
  for(let i=0;i<FISH_COUNT;i++){
    const colA = i%2===0? '#00ffff' : '#c77dff';
    const colB = i%2===0? '#00404d' : '#442244';
    const svg = makeFishSVG(i, colA, colB);
    svg.style.zIndex = 5;
    aquarium.appendChild(svg);

    // 初始位置
    const state = {
      el: svg,
      x: rand(-0.2*WIDTH(), WIDTH()*1.2),
      y: rand(0.05*HEIGHT(), 0.95*HEIGHT()),
      speed: rand(0.2, 0.8), // 速度
      scale: rand(0.6, 1.1),
      dir: Math.random() > 0.5 ? 1 : -1,
      targetTime: rand(2,6),
      t: 0
    };
    svg.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    fishes.push(state);
  }

  // 动画循环
  let last = performance.now();
  function tick(now){
    const dt = (now - last)/1000; last = now;
    // 保持 canvas 尺寸同步
    if(canvas.width !== aquarium.clientWidth || canvas.height !== aquarium.clientHeight){
      canvas.width = aquarium.clientWidth; canvas.height = aquarium.clientHeight;
      drawBG();
    }
    fishes.forEach(f=>{
      f.t += dt;
      if(f.t >= f.targetTime){
        // 设新目标
        f.targetTime = rand(2,6);
        f.t = 0;
        f.speed = rand(0.1, 0.9);
        // 新方向与目标位置
        f.dir = Math.random() > 0.5 ? 1 : -1;
        f.tx = rand(-0.2*WIDTH(), WIDTH()*1.2);
        f.ty = rand(0.05*HEIGHT(), 0.95*HEIGHT());
      }
      // 线性移动 towards tx,ty
      if(typeof f.tx === 'number'){
        const dx = f.tx - f.x;
        const dy = f.ty - f.y;
        f.x += dx * (0.2 * f.speed) * dt * 5;
        f.y += dy * (0.2 * f.speed) * dt * 5;
      } else {
        f.x += (0.5 - Math.random()) * f.speed * 30 * dt;
      }
      // 屏幕边界环绕
      if(f.x < -0.25*WIDTH()) f.x = WIDTH()*1.05;
      if(f.x > WIDTH()*1.05) f.x = -0.25*WIDTH();

      // 应用位置与朝向（flip）
      f.el.style.left = `${f.x}px`;
      f.el.style.top = `${f.y}px`;
      const flip = (f.dir === 1) ? 'scaleX(1)' : 'scaleX(-1)';
      f.el.style.transform = `translate(-50%,-50%) ${flip} scale(${f.scale}) rotate(${Math.sin(f.t*2)*6}deg)`;
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // 点击鱼会跳转到示例文章（演示交互）
  aquarium.querySelectorAll('.fish').forEach((el, idx)=>{
    el.style.cursor = 'pointer';
    el.addEventListener('click', ()=> {
      // 随机打开博客文章示例
      window.location.href = 'blog/post1.html';
    });
  });
}

// 等待元素尺寸就绪再开始
window.addEventListener('load', ()=> {
  start();
  document.getElementById('year').textContent = new Date().getFullYear();
});
window.addEventListener('resize', ()=> {
  // 重启以适配大小（简单处理）
  start();
});
