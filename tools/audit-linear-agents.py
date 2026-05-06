#!/usr/bin/env python3
"""
Linear Agent 合规审计脚本
由嘉怡 (PM Agent) 开发

MIT License

Copyright (c) 2026 Chris Wang / Bluemanta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

import json
import sys
import os
import requests
from datetime import datetime, timedelta

API_URL = "https://api.linear.app/graphql"
API_KEY = os.getenv("LINEAR_API_KEY")

def query_linear(query, variables=None):
    """调用 Linear GraphQL API"""
    import os
    api_key = os.getenv("LINEAR_API_KEY")
    
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    response = requests.post(API_URL, headers=headers, json=payload)
    
    if response.status_code != 200:
        print(f"❌ API 请求失败: {response.status_code}")
        print(f"响应内容: {response.text}")
    
    response.raise_for_status()
    return response.json()

def audit_comments():
    """审计评论格式"""
    print("🔍 审计评论格式...")
    
    query = """
    query($teamId: ID!) {
      issues(filter: {
        team: { id: { eq: $teamId } },
        comments: { body: { contains: "🤖" } }
      }) {
        nodes {
          identifier
          title
          comments {
            nodes {
              body
              user { name }
              createdAt
            }
          }
        }
      }
    }
    """
    
    variables = {"teamId": "e890eec9-ac9b-4617-a1f1-2c240a7a928f"}
    result = query_linear(query, variables)
    
    issues = result.get('data', {}).get('issues', {}).get('nodes', [])
    
    violations = []
    
    for issue in issues:
        for comment in issue.get('comments', {}).get('nodes', []):
            body = comment.get('body', '')
            
            # 检查是否带 🤖 标识
            if '🤖' in body:
                # 检查格式
                if '**状态**:' not in body:
                    violations.append({
                        'issue': issue['identifier'],
                        'problem': '缺少 **状态**: 字段'
                    })
                
                if '**详情**:' not in body and '**进度**:' not in body:
                    violations.append({
                        'issue': issue['identifier'],
                        'problem': '缺少详情或进度信息'
                    })
    
    return violations

def audit_status():
    """审计状态流转"""
    print("🔍 审计状态流转...")
    
    # 检查是否有 Agent 将状态改为 Done（应该只有人工才能改）
    query = """
    query($teamId: ID!) {
      issues(filter: {
        team: { id: { eq: $teamId } },
        state: { type: { eq: "completed" } }
      }) {
        nodes {
          identifier
          title
          state { name type }
          comments(last: 5) {
            nodes {
              body
              user { name }
            }
          }
        }
      }
    }
    """
    
    variables = {"teamId": "e890eec9-ac9b-4617-a1f1-2c240a7a928f"}
    result = query_linear(query, variables)
    
    issues = result.get('data', {}).get('issues', {}).get('nodes', [])
    
    suspicious = []
    
    for issue in issues:
        comments = issue.get('comments', {}).get('nodes', [])
        # 检查最近评论是否有 Agent 标识
        for comment in comments:
            if '🤖' in comment.get('body', ''):
                suspicious.append({
                    'issue': issue['identifier'],
                    'problem': 'Agent 可能违规将状态改为 Done'
                })
                break
    
    return suspicious

def audit_blocked():
    """审计阻塞任务"""
    print("🔍 审计阻塞任务...")
    
    query = """
    query($teamId: ID!) {
      issues(filter: {
        team: { id: { eq: $teamId } },
        labels: { name: { eq: "Blocked" } }
      }) {
        nodes {
          identifier
          title
          updatedAt
          comments(last: 1) {
            nodes {
              body
              createdAt
            }
          }
        }
      }
    }
    """
    
    variables = {"teamId": "e890eec9-ac9b-4617-a1f1-2c240a7a928f"}
    result = query_linear(query, variables)
    
    issues = result.get('data', {}).get('issues', {}).get('nodes', [])
    
    stale = []
    now = datetime.now()
    
    for issue in issues:
        updated = datetime.fromisoformat(issue['updatedAt'].replace('Z', '+00:00'))
        days_since = (now - updated).days
        
        if days_since > 3:
            stale.append({
                'issue': issue['identifier'],
                'days': days_since,
                'problem': f'阻塞超过 {days_since} 天，需要人工介入'
            })
    
    return stale

def main():
    import os
    
    if not os.getenv("LINEAR_API_KEY"):
        print("❌ LINEAR_API_KEY 未设置", file=sys.stderr)
        sys.exit(1)
    
    print(f"{'='*60}")
    print(f"Linear Agent 合规审计 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")
    
    # 审计评论
    comment_violations = audit_comments()
    
    # 审计状态
    status_violations = audit_status()
    
    # 审计阻塞
    blocked_stale = audit_blocked()
    
    # 输出结果
    print(f"\n{'='*60}")
    print("审计结果汇总")
    print(f"{'='*60}\n")
    
    if not comment_violations and not status_violations and not blocked_stale:
        print("✅ 审计通过！未发现违规。")
    else:
        print(f"⚠️  发现 {len(comment_violations)} 个评论格式问题")
        print(f"⚠️  发现 {len(status_violations)} 个状态流转问题")
        print(f"⚠️  发现 {len(blocked_stale)} 个长期阻塞任务\n")
        
        if comment_violations:
            print("评论格式问题:")
            for v in comment_violations[:5]:  # 只显示前5个
                print(f"  - {v['issue']}: {v['problem']}")
        
        if status_violations:
            print("\n状态流转问题:")
            for v in status_violations[:5]:
                print(f"  - {v['issue']}: {v['problem']}")
        
        if blocked_stale:
            print("\n长期阻塞任务:")
            for v in blocked_stale[:5]:
                print(f"  - {v['issue']}: {v['problem']}")
    
    print(f"\n{'='*60}")
    print("审计完成")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
