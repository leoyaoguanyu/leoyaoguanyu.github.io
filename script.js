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
            
            // 强制重新渲染视频
            this.style.display = 'none';
            setTimeout(() => {
                this.style.display = 'block';
            }, 10);
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