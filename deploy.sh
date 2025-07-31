#!/bin/bash

# 公司产品展示网站部署脚本
# 用于快速部署到阿里云服务器

echo "🚀 开始部署公司产品展示网站..."

# 配置信息
SERVER_IP=""
SERVER_USER=""
SERVER_PATH="/var/www/html"
DOMAIN=""

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用方法: ./deploy.sh <服务器IP> <用户名> [域名]"
    echo "示例: ./deploy.sh 123.456.789.10 root example.com"
    exit 1
fi

SERVER_IP=$1
SERVER_USER=$2
DOMAIN=$3

echo "📋 部署配置:"
echo "   服务器IP: $SERVER_IP"
echo "   用户名: $SERVER_USER"
echo "   部署路径: $SERVER_PATH"
if [ ! -z "$DOMAIN" ]; then
    echo "   域名: $DOMAIN"
fi

# 检查必要文件是否存在
echo "🔍 检查文件..."
if [ ! -f "index.html" ]; then
    echo "❌ 错误: index.html 文件不存在"
    exit 1
fi

if [ ! -f "styles.css" ]; then
    echo "❌ 错误: styles.css 文件不存在"
    exit 1
fi

if [ ! -f "script.js" ]; then
    echo "❌ 错误: script.js 文件不存在"
    exit 1
fi

echo "✅ 所有必要文件都存在"

# 创建临时目录
echo "📁 创建临时目录..."
TEMP_DIR=$(mktemp -d)
cp index.html styles.css script.js "$TEMP_DIR/"

# 上传文件到服务器
echo "📤 上传文件到服务器..."
scp -r "$TEMP_DIR"/* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ 文件上传成功"
else
    echo "❌ 文件上传失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 设置文件权限
echo "🔐 设置文件权限..."
ssh "$SERVER_USER@$SERVER_IP" "sudo chown -R www-data:www-data $SERVER_PATH && sudo chmod -R 755 $SERVER_PATH"

# 清理临时目录
rm -rf "$TEMP_DIR"

# 检查Web服务器状态
echo "🌐 检查Web服务器状态..."
ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl status nginx" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Nginx 正在运行"
    WEB_SERVER="nginx"
else
    ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl status apache2" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Apache 正在运行"
        WEB_SERVER="apache"
    else
        echo "⚠️  警告: 未检测到Nginx或Apache运行"
        WEB_SERVER="unknown"
    fi
fi

# 重启Web服务器
if [ "$WEB_SERVER" != "unknown" ]; then
    echo "🔄 重启Web服务器..."
    if [ "$WEB_SERVER" = "nginx" ]; then
        ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl reload nginx"
    else
        ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl reload apache2"
    fi
    echo "✅ Web服务器已重启"
fi

# 测试网站可访问性
echo "🧪 测试网站可访问性..."
if [ ! -z "$DOMAIN" ]; then
    TEST_URL="http://$DOMAIN"
else
    TEST_URL="http://$SERVER_IP"
fi

sleep 3
if curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" | grep -q "200"; then
    echo "✅ 网站部署成功！"
    echo "🌐 访问地址: $TEST_URL"
else
    echo "⚠️  网站可能还在启动中，请稍后访问: $TEST_URL"
fi

echo ""
echo "📝 部署完成！"
echo "💡 提示:"
echo "   - 如果使用域名，请确保DNS解析已生效"
echo "   - 建议配置HTTPS证书以提高安全性"
echo "   - 定期备份网站文件"
echo ""
echo "🔧 如需配置HTTPS，请参考README.md中的说明" 