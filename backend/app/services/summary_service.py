from typing import List
import os
import openai

def simple_truncate_summary(text: str, max_length: int = 100) -> str:
    return text[:max_length] + ("..." if len(text) > max_length else "")

# TODO: 可扩展TextRank、LLM等算法

def generate_summary(text: str, algo: str = "truncate", length: int = 100, detail: int = 1, config: dict = None) -> str:
    if algo == "truncate":
        return simple_truncate_summary(text, max_length=length)
    elif algo == "textrank":
        # 占位实现
        return "TextRank摘要算法占位"
    elif algo == "llm":
        return "LLM摘要算法占位"
    elif algo == "doubao":
        # 通过 OpenAI 兼容 API 调用火山引擎豆包大模型
        api_base = os.getenv("DOUBAO_API_BASE", "https://ark.cn-beijing.volces.com/api/v3")
        api_key = os.getenv("DOUBAO_API_KEY", "")
        model = os.getenv("DOUBAO_MODEL", "doubao-1.6-chat")
        if config:
            api_base = config.get("api_base", api_base)
            api_key = config.get("api_key", api_key)
            model = config.get("model", model)
        if not api_key:
            return "[豆包API密钥未配置]"
        openai.api_base = api_base
        openai.api_key = api_key
        prompt = f"请对以下内容进行专业、简明的中文摘要，字数不超过{length}字：\n{text}"
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=length*2
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"[豆包摘要失败]{e}"
    else:
        return text 