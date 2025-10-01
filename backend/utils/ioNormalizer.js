/**
 * Input/Output Normalization Utility for Coding Platform
 * Handles consistent parsing and formatting across all data types and languages
 */

class IONormalizer {
  /**
   * Normalize input from various formats to standard format
   * @param {string} input - Raw input string
   * @param {string} inputFormat - Format type (single_line, multi_line, array, matrix)
   * @param {Array} dataTypes - Array of data types for each input parameter
   * @returns {string} - Normalized input string
   */
  static normalizeInput(input, inputFormat = 'single_line', dataTypes = ['integer']) {
    if (!input || input.trim() === '') {
      return '';
    }

    let normalizedInput = input.trim();

    // Handle JSON array format conversion to space-separated
    if (normalizedInput.includes('[') && normalizedInput.includes(']')) {
      // Convert "[1, 2, 3, 4, 5]" to "1 2 3 4 5"
      normalizedInput = normalizedInput
        .replace(/[\[\]]/g, '')
        .replace(/,\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Handle multi-line inputs
    if (inputFormat === 'multi_line') {
      const lines = normalizedInput.split('\n');
      return lines.map(line => line.trim()).join('\n');
    }

    // Handle matrix inputs
    if (inputFormat === 'matrix') {
      const lines = normalizedInput.split('\n');
      return lines.map(line => {
        if (line.includes('[') && line.includes(']')) {
          return line.replace(/[\[\]]/g, '').replace(/,\s*/g, ' ').trim();
        }
        return line.trim();
      }).join('\n');
    }

    return normalizedInput;
  }

  /**
   * Normalize output for consistent comparison
   * @param {string} output - Raw output string
   * @param {string} outputFormat - Format type (single_value, array, matrix)
   * @param {string} dataType - Expected output data type
   * @returns {string} - Normalized output string
   */
  static normalizeOutput(output, outputFormat = 'single_value', dataType = 'integer') {
    if (!output || output.trim() === '') {
      return 'null';
    }

    let normalizedOutput = output.trim();

    // Handle array outputs
    if (outputFormat === 'array' || normalizedOutput.includes('[')) {
      // Convert "[1, 2, 3]" to "1 2 3" or keep as is based on expected format
      if (normalizedOutput.includes('[') && normalizedOutput.includes(']')) {
        normalizedOutput = normalizedOutput
          .replace(/[\[\]]/g, '')
          .replace(/,\s*/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    // Handle boolean outputs
    if (dataType === 'boolean') {
      const lower = normalizedOutput.toLowerCase();
      if (lower === 'true' || lower === '1') return 'true';
      if (lower === 'false' || lower === '0') return 'false';
    }

    // Handle null/empty cases
    if (normalizedOutput === '' || normalizedOutput.toLowerCase() === 'none' || 
        normalizedOutput.toLowerCase() === 'null' || normalizedOutput === 'undefined') {
      return 'null';
    }

    return normalizedOutput;
  }

  /**
   * Generate language-specific solution template
   * @param {string} language - Programming language
   * @param {string} functionName - Function name for the problem
   * @param {Array} inputTypes - Array of input parameter types
   * @param {string} outputType - Expected output type
   * @param {string} inputFormat - Input format type
   * @returns {string} - Language-specific template code
   */
  static generateSolutionTemplate(language, functionName = 'solution', inputTypes = ['integer'], outputType = 'integer', inputFormat = 'single_line') {
    const templates = {
      python: this.generatePythonTemplate(functionName, inputTypes, outputType, inputFormat),
      cpp: this.generateCppTemplate(functionName, inputTypes, outputType, inputFormat),
      c: this.generateCTemplate(functionName, inputTypes, outputType, inputFormat),
      java: this.generateJavaTemplate(functionName, inputTypes, outputType, inputFormat),
      javascript: this.generateJavaScriptTemplate(functionName, inputTypes, outputType, inputFormat)
    };

    return templates[language] || templates.python;
  }

  static generatePythonTemplate(functionName, inputTypes, outputType, inputFormat) {
    let inputReading = '';
    let functionParams = [];

    if (inputFormat === 'single_line' && inputTypes.length === 1) {
      if (inputTypes[0].includes('array')) {
        inputReading = `try:
    line = input().strip()
    if not line:
        nums = []
    else:
        nums = list(map(int, line.split()))
except:
    nums = []`;
        functionParams.push('nums');
      } else if (inputTypes[0] === 'string') {
        inputReading = `try:
    s = input().strip()
except:
    s = ""`;
        functionParams.push('s');
      } else {
        inputReading = `try:
    n = int(input().strip())
except:
    n = 0`;
        functionParams.push('n');
      }
    } else if (inputFormat === 'multi_line') {
      inputReading = `try:
    lines = []
    while True:
        try:
            line = input().strip()
            if line:
                lines.append(line)
        except EOFError:
            break
except:
    lines = []`;
      functionParams.push('lines');
    }

    const outputHandling = outputType.includes('array') ? 
      `result = ${functionName}(${functionParams.join(', ')})
if isinstance(result, list):
    print(' '.join(map(str, result)))
else:
    print(result if result is not None else 'null')` :
      `result = ${functionName}(${functionParams.join(', ')})
print(result if result is not None else 'null')`;

    return `def ${functionName}(${functionParams.join(', ')}):
    # Write your solution here
    pass

# Input handling
${inputReading}

# Execute and output
${outputHandling}`;
  }

  static generateCppTemplate(functionName, inputTypes, outputType, inputFormat) {
    let includes = '#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nusing namespace std;\n\n';
    let inputReading = '';
    let functionParams = [];
    let functionDeclaration = '';

    if (inputTypes[0].includes('array')) {
      functionDeclaration = `vector<int> ${functionName}(vector<int>& nums)`;
      inputReading = `string line;
    getline(cin, line);
    vector<int> nums;
    if (!line.empty()) {
        istringstream iss(line);
        int num;
        while (iss >> num) {
            nums.push_back(num);
        }
    }`;
    } else if (inputTypes[0] === 'string') {
      functionDeclaration = `string ${functionName}(string s)`;
      inputReading = `string s;
    getline(cin, s);`;
    } else {
      functionDeclaration = `int ${functionName}(int n)`;
      inputReading = `int n;
    cin >> n;`;
    }

    const outputHandling = outputType.includes('array') ?
      `vector<int> result = ${functionName}(${inputTypes[0].includes('array') ? 'nums' : inputTypes[0] === 'string' ? 's' : 'n'});
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;` :
      `auto result = ${functionName}(${inputTypes[0].includes('array') ? 'nums' : inputTypes[0] === 'string' ? 's' : 'n'});
    cout << result << endl;`;

    return `${includes}${functionDeclaration} {
    // Write your solution here
    return ${outputType.includes('array') ? 'vector<int>()' : outputType === 'string' ? '""' : '0'};
}

int main() {
    ${inputReading}
    
    ${outputHandling}
    
    return 0;
}`;
  }

  static generateCTemplate(functionName, inputTypes, outputType, inputFormat) {
    let includes = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n';
    
    return `${includes}int ${functionName}(int n) {
    // Write your solution here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    
    int result = ${functionName}(n);
    printf("%d\\n", result);
    
    return 0;
}`;
  }

  static generateJavaTemplate(functionName, inputTypes, outputType, inputFormat) {
    let imports = 'import java.util.*;\nimport java.io.*;\n\n';
    
    const className = 'Solution';
    let methodDeclaration = '';
    let inputReading = '';
    
    if (inputTypes[0].includes('array')) {
      methodDeclaration = `public int[] ${functionName}(int[] nums)`;
      inputReading = `Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        int[] nums;
        if (line.isEmpty()) {
            nums = new int[0];
        } else {
            String[] parts = line.split(" ");
            nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i]);
            }
        }`;
    } else {
      methodDeclaration = `public int ${functionName}(int n)`;
      inputReading = `Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();`;
    }

    return `${imports}public class ${className} {
    ${methodDeclaration} {
        // Write your solution here
        return ${outputType.includes('array') ? 'new int[0]' : '0'};
    }
    
    public static void main(String[] args) {
        ${inputReading}
        
        ${className} solution = new ${className}();
        ${outputType.includes('array') ? 'int[] result' : 'int result'} = solution.${functionName}(${inputTypes[0].includes('array') ? 'nums' : 'n'});
        
        ${outputType.includes('array') ? 
          'for (int i = 0; i < result.length; i++) {\n            if (i > 0) System.out.print(" ");\n            System.out.print(result[i]);\n        }\n        System.out.println();' :
          'System.out.println(result);'}
    }
}`;
  }

  static generateJavaScriptTemplate(functionName, inputTypes, outputType, inputFormat) {
    let inputReading = '';
    
    if (inputTypes[0].includes('array')) {
      inputReading = `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    try {
        const nums = line.trim() ? line.trim().split(' ').map(Number) : [];
        const result = ${functionName}(nums);
        console.log(Array.isArray(result) ? result.join(' ') : result);
    } catch (error) {
        console.log('null');
    }
    rl.close();
});`;
    } else {
      inputReading = `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    try {
        const n = parseInt(line.trim());
        const result = ${functionName}(n);
        console.log(result);
    } catch (error) {
        console.log('null');
    }
    rl.close();
});`;
    }

    return `function ${functionName}(${inputTypes[0].includes('array') ? 'nums' : 'n'}) {
    // Write your solution here
    return ${outputType.includes('array') ? '[]' : '0'};
}

${inputReading}`;
  }

  /**
   * Parse test case input based on format and data types
   * @param {string} input - Raw input string
   * @param {string} inputFormat - Input format type
   * @param {Array} dataTypes - Expected data types
   * @returns {Object} - Parsed input object
   */
  static parseTestCaseInput(input, inputFormat, dataTypes) {
    const normalized = this.normalizeInput(input, inputFormat, dataTypes);
    
    const parsed = {
      raw: input,
      normalized: normalized,
      format: inputFormat,
      types: dataTypes
    };

    return parsed;
  }

  /**
   * Validate test case output format
   * @param {string} expected - Expected output
   * @param {string} actual - Actual output from execution
   * @param {string} outputFormat - Output format type
   * @param {string} dataType - Expected data type
   * @returns {Object} - Validation result
   */
  static validateOutput(expected, actual, outputFormat, dataType) {
    const normalizedExpected = this.normalizeOutput(expected, outputFormat, dataType);
    const normalizedActual = this.normalizeOutput(actual, outputFormat, dataType);
    
    return {
      passed: normalizedExpected === normalizedActual,
      expected: normalizedExpected,
      actual: normalizedActual,
      raw: {
        expected: expected,
        actual: actual
      }
    };
  }
}

module.exports = IONormalizer;
