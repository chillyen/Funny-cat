import GUN from 'gun';
import 'gun/sea'; // 导入 Gun 的安全和认证模块

// 初始化数据库
export const db = GUN();

// 初始化 Gun 用户
export const user = db.user().recall({ sessionStorage: true });

// 监听认证事件
db.on('auth', async (event) => {
	const alias = await user.get('alias'); // 获取用户名
	// 检查是否已存在永久 ID
	const existingId = await user.get('permanentId');
	if (!existingId) {
		// 不存在则生成新的永久 ID 并存储
		const permanentId = generateUserId();
		user.get('permanentId').put(permanentId);
		console.log(`New permanent ID generated: ${permanentId}`);
	} else {
		// 如果已存在，使用现有的 ID
		console.log(`Existing permanent ID: ${existingId}`);
	}
	console.log(`signed in as ${existingId}`);
    console.log(alias);
});

// 生成永久 ID 的函数
export const generateUserId = () => {
	return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};
