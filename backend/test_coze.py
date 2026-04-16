"""
测试 Coze Bot API 连接
"""
import asyncio
import sys
import os

# 添加路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.llm_bridge.bridge import LLMBridge, ChatParameters


async def test_coze():
    print("=" * 50)
    print("测试 Coze Bot API 连接")
    print("=" * 50)
    
    # 加载配置
    config_path = os.path.join(os.path.dirname(__file__), "app/config/llm_bridge_config.yaml")
    bridge = LLMBridge.from_config(config_path)
    
    # 测试消息
    test_message = "我后悔五年前没有买比特币，现在感觉错过了暴富的机会。"
    
    print(f"\n发送测试消息: {test_message}\n")
    print("等待赛博神父回复...\n")
    print("-" * 50)
    
    try:
        response = await bridge.chat(
            model="priest_coze",
            messages=[{"role": "user", "content": test_message}],
            params=ChatParameters()
        )
        
        print(response.content)
        print("-" * 50)
        print(f"\n✅ 连接成功!")
        print(f"模型: {response.model_id}")
        
    except Exception as e:
        print(f"\n❌ 连接失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_coze())
