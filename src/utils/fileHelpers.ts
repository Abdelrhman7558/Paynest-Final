
export const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvText = event.target?.result as string;
                const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');

                if (lines.length === 0) {
                    resolve([]);
                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const result = [];

                for (let i = 1; i < lines.length; i++) {
                    const currentLine = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));

                    if (currentLine.length === headers.length) {
                        const obj: any = {};
                        for (let j = 0; j < headers.length; j++) {
                            obj[headers[j]] = currentLine[j];
                        }
                        result.push(obj);
                    }
                }
                resolve(result);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
