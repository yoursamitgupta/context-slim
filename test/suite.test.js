import test from 'node:test';
import assert from 'node:assert';
import { slimJavaScript } from '../src/parsers/javascript.js';
import { slimPython } from '../src/parsers/python.js';
import { estimateTokens, computeReduction } from '../src/utils/tokens.js';

test('slimJavaScript preserves imports and compresses function bodies', () => {
  const code = `
import React from 'react';
import { useState } from 'react';

/**
 * Calculates user metrics.
 * @param {string} id
 */
export function calculateMetrics(id) {
  const data = fetchUserData(id);
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    total += data[i].score;
  }
  return total * 1.5;
}

export interface UserConfig {
  theme: string;
  autoSave: boolean;
}
`;

  const result = slimJavaScript(code);
  assert.match(result, /import React from 'react';/);
  assert.match(result, /export interface UserConfig/);
  assert.match(result, /Calculates user metrics/);
  assert.match(result, /export function calculateMetrics\(id\) { \/\* implementation truncated \*\/ }/);
  assert.ok(!result.includes('for (let i = 0; i < data.length; i++)'));
});

test('slimPython preserves class methods, signatures, and docstrings', () => {
  const code = `
from typing import List, Optional

class UserManager:
    """Manages system users and credentials."""

    def __init__(self, db_url: str):
        self.db = connect(db_url)
        self.cache = {}

    def get_user(self, user_id: str) -> Optional[dict]:
        """Fetch user by id."""
        record = self.db.query(user_id)
        if not record:
            return None
        return record.to_dict()
`;

  const result = slimPython(code);
  assert.match(result, /from typing import List, Optional/);
  assert.match(result, /class UserManager:/);
  assert.match(result, /"""Manages system users and credentials."""/);
  assert.match(result, /def __init__\(self, db_url: str\):/);
  assert.match(result, /def get_user\(self, user_id: str\) -> Optional\[dict\]:/);
  assert.ok(!result.includes('self.cache = {}'));
});

test('token reduction computes accurate metrics', () => {
  const original = 'function a() {\n  let x = 1;\n  let y = 2;\n  return x + y;\n}';
  const slimmed = 'function a() { /* implementation truncated */ }';

  const metrics = computeReduction(original, slimmed);
  assert.ok(metrics.originalTokens > 0);
  assert.ok(metrics.slimmedTokens > 0);
  assert.ok(metrics.reductionPercentage >= 0);
});
