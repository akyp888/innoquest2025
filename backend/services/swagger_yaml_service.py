import re
from openai import OpenAI

def generate_swagger_yaml(prompt: str) -> str:
    client = OpenAI(api_key="")
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Generate BIAN swagger api specifications for these user stories:\n\n{prompt}"}],
    )

    content = completion.choices[0].message.content.strip()

    # Extract the YAML block between triple backticks ```yaml ... ```
    match = re.search(r"```yaml\s*(.*?)```", content, re.DOTALL)
    if match:
        return match.group(1).strip()  # return only the YAML block
    return content  # fallback to full content if no match
