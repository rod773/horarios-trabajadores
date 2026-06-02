const OPERATORS = [
  { sign: "+", fn: (a: number, b: number) => a + b },
  { sign: "-", fn: (a: number, b: number) => a - b },
  { sign: "×", fn: (a: number, b: number) => a * b },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateCaptcha() {
  const op = OPERATORS[randomInt(0, OPERATORS.length - 1)];
  let a: number, b: number;

  if (op.sign === "×") {
    a = randomInt(2, 9);
    b = randomInt(2, 9);
  } else if (op.sign === "-") {
    a = randomInt(5, 20);
    b = randomInt(1, a);
  } else {
    a = randomInt(1, 50);
    b = randomInt(1, 50);
  }

  const answer = op.fn(a, b);
  const expression = `${a} ${op.sign} ${b}`;
  const token = Buffer.from(`${expression}:${answer}:${Date.now()}`).toString("base64");

  return { expression, answer, token };
}

export function verifyCaptcha(token: string, userAnswer: string) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    const answer = parseInt(parts[1], 10);
    const timestamp = parseInt(parts[2], 10);
    const age = Date.now() - timestamp;
    if (age > 5 * 60 * 1000) return false;
    return parseInt(userAnswer, 10) === answer;
  } catch {
    return false;
  }
}
