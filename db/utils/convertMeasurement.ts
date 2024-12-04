export function convertLbsToKg(lbs: number) {
    const kg = lbs * 0.45359237;
    return parseFloat(kg.toFixed(2));
}


export function convertImperialToMetric(height: string) {
    const heightStringArr = height.split('.');
    const feet = Number(heightStringArr[0]);
    const inches = Number(heightStringArr[1]);

    const totalInches = feet * 12 + inches;
    const cm = totalInches * 2.54;
  
    return parseFloat(cm.toFixed(2));
  
}
