// 导航栏交互
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// 点击导航链接时关闭移动端菜单
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
}));

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// 视频播放器增强功能
document.addEventListener('DOMContentLoaded', () => {
    const videoPlayers = document.querySelectorAll('.video-player');
    
    videoPlayers.forEach(video => {
        // 视频加载错误处理
        video.addEventListener('error', function(e) {
            console.error('视频加载失败:', e);
            this.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background: #f0f0f0; 
                    color: #666; 
                    border-radius: 8px;
                    flex-direction: column;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>视频加载失败</p>
                    <p style="font-size: 0.8rem; margin-top: 5px;">请检查视频文件是否存在</p>
                </div>
            `;
        });
        
        // 视频加载成功处理
        video.addEventListener('loadeddata', function() {
            console.log('视频加载成功');
            // 禁用所有滤镜
            this.style.filter = 'none';
        });
        
        // 视频播放错误处理
        video.addEventListener('stalled', function() {
            console.warn('视频播放停滞');
        });
        
        // 检测视频是否只有音频没有画面
        video.addEventListener('loadedmetadata', function() {
            console.log('视频元数据加载完成');
            console.log('视频宽度:', this.videoWidth);
            console.log('视频高度:', this.videoHeight);
            console.log('视频时长:', this.duration);
            
            // 如果视频尺寸为0，说明可能只有音频
            if (this.videoWidth === 0 || this.videoHeight === 0) {
                console.warn('视频可能只有音频轨道，没有视频轨道');
                this.style.filter = 'none';
            }
        });
        
        // 视频播放时禁用滤镜
        video.addEventListener('play', function() {
            this.style.filter = 'none';
        });
        
        // 视频暂停时禁用滤镜
        video.addEventListener('pause', function() {
            this.style.filter = 'none';
        });
        
        // 视频时间更新时检查
        video.addEventListener('timeupdate', function() {
            // 如果视频播放但画面没有变化，尝试强制刷新
            if (!this.paused && this.currentTime > 0) {
                // 每5秒检查一次
                if (Math.floor(this.currentTime) % 5 === 0) {
                    console.log('视频播放中，当前时间:', this.currentTime);
                }
            }
        });
    });
});

// 滚动动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// 观察所有需要动画的元素
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature, .product-card, .contact-item, .demo-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// 产品卡片悬停效果增强
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// 按钮点击效果
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // 创建涟漪效果
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 添加涟漪效果的CSS
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后的初始化
window.addEventListener('load', () => {
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // 检查并显示欢迎消息
    if (!localStorage.getItem('visited')) {
        setTimeout(() => {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #8b5cf6;
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                z-index: 10000;
                animation: slideIn 0.5s ease;
            `;
            welcomeMessage.textContent = '欢迎访问我们的网站！';
            document.body.appendChild(welcomeMessage);
            
            setTimeout(() => {
                welcomeMessage.style.animation = 'slideOut 0.5s ease';
                setTimeout(() => {
                    welcomeMessage.remove();
                }, 500);
            }, 3000);
            
            localStorage.setItem('visited', 'true');
        }, 1000);
    }
});

// 添加动画CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyle);

// 添加返回顶部按钮
const backToTop = document.createElement('button');
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTop.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #8b5cf6;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
    z-index: 1000;
`;

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

backToTop.addEventListener('mouseenter', () => {
    backToTop.style.transform = 'translateY(-3px)';
    backToTop.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.4)';
});

backToTop.addEventListener('mouseleave', () => {
    backToTop.style.transform = 'translateY(0)';
    backToTop.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
});

document.body.appendChild(backToTop);

// 监听滚动显示/隐藏返回顶部按钮
window.addEventListener('scroll', () => {
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    }
});

// 新闻滚动控制
document.addEventListener('DOMContentLoaded', () => {
    const newsScrollTrack = document.querySelector('.news-scroll-track');
    const newsScrollCards = document.querySelectorAll('.news-scroll-card');
    
    if (newsScrollTrack) {
        // 鼠标悬停时暂停动画
        newsScrollTrack.addEventListener('mouseenter', () => {
            newsScrollTrack.style.animationPlayState = 'paused';
        });
        
        // 鼠标离开时恢复动画
        newsScrollTrack.addEventListener('mouseleave', () => {
            newsScrollTrack.style.animationPlayState = 'running';
        });
        
        // 为每个卡片添加悬停效果
        newsScrollCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // 当鼠标悬停在卡片上时，暂停整个滚动
                newsScrollTrack.style.animationPlayState = 'paused';
            });
            
            card.addEventListener('mouseleave', () => {
                // 当鼠标离开卡片时，恢复滚动
                newsScrollTrack.style.animationPlayState = 'running';
            });
        });
    }
});

// 验证码生成和处理
function generateCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置背景色
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 生成随机验证码（4位数字+字母）
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 保存正确答案
    window.correctCaptcha = captcha;
    
    // 设置字体样式
    ctx.font = '20px Arial';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制验证码文字
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.fillText(captcha, x, y);
    
    // 添加干扰线
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // 添加干扰点
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.4)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
}

// 验证码初始化和刷新
document.addEventListener('DOMContentLoaded', function() {
    // 生成初始验证码
    generateCaptcha();
    
    // 刷新按钮事件
    const refreshBtn = document.getElementById('refreshCaptcha');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            generateCaptcha();
        });
    }
    
    // 点击验证码图片也可以刷新
    const captchaCanvas = document.getElementById('captchaCanvas');
    if (captchaCanvas) {
        captchaCanvas.addEventListener('click', function() {
            generateCaptcha();
        });
    }
});

// EmailJS表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 验证验证码
            const captchaInput = document.getElementById('captcha').value;
            const correctCaptcha = window.correctCaptcha;
            
            if (captchaInput !== correctCaptcha) {
                alert('验证码错误，请重新输入！');
                return;
            }
            
            // 获取表单数据
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                country: document.getElementById('country').value,
                company: document.getElementById('company').value,
                address: document.getElementById('address').value,
                industry: document.getElementById('industry').value,
                content: document.getElementById('content').value,
                captcha: captchaInput,
                submission_time: new Date().toLocaleString('zh-CN')
            };
            
            // 显示发送中状态
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '发送中...';
            submitBtn.disabled = true;
            
            // 发送主邮件给公司
            emailjs.send('service_moqblzm', 'template_dh8532s', formData)
                .then(function(response) {
                    console.log('主邮件发送成功:', response);
                    
                    // 发送自动回复给用户
                    return emailjs.send('service_moqblzm', 'template_5w8r3yi', formData);
                })
                .then(function(response) {
                    console.log('自动回复发送成功:', response);
                    alert('消息发送成功！我们已收到您的咨询，会在1-2个工作日内回复您。');
                    
                    // 重置表单
                    contactForm.reset();
                    generateCaptcha(); // 重新生成验证码
                })
                .catch(function(error) {
                    console.error('邮件发送失败:', error);
                    alert('发送失败，请稍后重试或直接联系我们：400-888-8888');
                })
                .finally(function() {
                    // 恢复按钮状态
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}); 