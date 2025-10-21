const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  console.log('=== 测试照片上传功能 ===\n');

  // 创建一个测试图片（1x1 像素的 PNG）
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, testImageBuffer);

  console.log(`✓ 已创建测试图片: ${testImagePath}`);
  console.log(`✓ 文件大小: ${testImageBuffer.length} bytes\n`);

  try {
    // 准备表单数据
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('category', 'match_photos');

    console.log('正在上传到 http://localhost:3000/api/upload/photo ...\n');

    // 发送请求（需要 token，这里使用一个测试 token）
    const response = await axios.post(
      'http://localhost:3000/api/upload/photo',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer test-token' // 实际使用时需要真实 token
        }
      }
    );

    console.log('✅ 上传成功！\n');
    console.log('【返回数据】');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data.url) {
      console.log('\n【访问URL】');
      console.log(`http://localhost:3000${response.data.data.url}`);
    }

  } catch (error) {
    console.log('❌ 上传失败:\n');

    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  } finally {
    // 清理测试文件
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n✓ 已清理测试图片文件');
    }
  }
}

testUpload();
