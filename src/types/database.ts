export interface AthleteRegistration {
  id: string; 
  firstName: string; 
  lastName: string;
  grade: number; 
  birthday: Date;
  middleSchool: 
    | 'Brookland Middle' | 'Elko Middle' | 'Fairfield Middle' 
    | 'George H. Moody Middle' | 'Holman Middle' | 'Hungary Creek Middle' 
    | 'L. Douglas Wilder Middle' | 'Pocohontas Middle' | 'Quioccasin Middle' 
    | 'John Rolfe Middle' | 'Short Pump Middle' | 'Tuckahoe Middle' | 'Other';
  team: 'Girls' | 'Boys';
  type: 'New Athlete' | 'Returning Athlete';
  phone: string;
  email: string;
  parent1Name: string;
  parent1Email: string;
  parent1Phone: string;
  createdAt: Date; 
}