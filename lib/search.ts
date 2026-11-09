export const normalizeSearch = (input:string) => input.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLocaleLowerCase('vi').replace(/\s+/g,'').trim();
