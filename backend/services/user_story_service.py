from openai import OpenAI

def generate_user_stories(prompt: str) -> str:
    client = OpenAI(api_key="")
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Generate BIAN user stories for: {prompt}"}],
    )
    return completion.choices[0].message.content.strip()
