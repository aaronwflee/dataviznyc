import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_style('whitegrid')
plt.style.use('seaborn-talk')

def custom_sort(df, sort_list, var='GROUP'):
    order = {n:i for i, n in enumerate(sort_list)}
    df['order'] = df[var].map(order)
    df.sort_values('order', inplace=True)
    return df.drop(columns=['order'])


def proportion(df, var='WRKHOMEABLE', groupby_var=None):
    if groupby_var:
        return df.groupby(groupby_var)['LVWT'].sum() / df.groupby(groupby_var)['LVWT'].sum().sum()
    return ((df[var] * df['LVWT'])).sum() / df['LVWT'].sum()

def comparison(groupby_var, borough=False, palette1='Greys', palette2='YlGnBu', save=None):
    all_others = atus_all.groupby(groupby_var).apply(proportion)

    if borough:
        nyc_add = atus_nyc.groupby('COUNTY_NAME').apply(proportion)
    else:
        nyc_add = pd.Series([proportion(atus_nyc)], index=['NYC'])
    combined = pd.concat([all_others, nyc_add]).reset_index()
    combined.columns = ['GROUP', 'PCT_WFH']
    combined['COLOR'] = 'gray'
    combined.loc[combined['GROUP'].isin(all_others.index), 'COLOR'] = sns.color_palette(palette1, n_colors=len(all_others)).as_hex()
    combined.loc[combined['GROUP'].isin(nyc_add.index), 'COLOR'] = sns.color_palette(palette2, n_colors=len(nyc_add)).as_hex()
    if save:
        combined.to_csv(f'../resources/wfh/{save}.csv', index=False)
    return combined
    
def split_both(groupby_var, save=None, sort=None):
    df = pd.DataFrame(data={'USA': atus_all.groupby(groupby_var).apply(proportion),
                            'NYC': atus_nyc.groupby(groupby_var).apply(proportion)})
    df.index.name = 'GROUP'
    df = pd.melt(df.reset_index(), id_vars=['GROUP'], value_vars=['USA', 'NYC'],
                 var_name='AREA', value_name='PCT_WFH').sort_values('GROUP')
    if sort:
        df = custom_sort(df, sort)
    if save:
        df.to_csv(f'../resources/wfh/{save}.csv', index=True)
    return df

def barplot(df):
    sns.barplot(x=df['PCT_WFH'], y=df['GROUP'], palette=df['COLOR'], orient='h')#series.index.map(colors).fillna('lightgray'))
    plt.xlabel('')
    plt.ylabel('%')
    plt.show()



var ='WRKHOMEABLE'  ## other alternatives include 'WRKHOMEEV', 'WRKHOMEPD', 'WRKHOMEOFTEN'
highlighted_regions = {'36061':'Manhattan', 
                       '36047':'Brooklyn', 
                       '36081':'Queens' , 
                       '36005':'Bronx', 
                       '36085':'Staten Island'}

colors = {'Manhattan':'#74a9cf', 'Brooklyn':'#a6bddb', 'Queens':'#2b8cbe' , 'Bronx':'#d0d1e6', 'Staten Island':'#045a8d'}


atus = pd.read_csv('../resources/wfh/atus_00005.csv.gz', 
                 dtype={'REGION':str, 'STATEFIP':str,  'METAREA':str, 'COUNTY':str})
atus['COUNTY'] = atus['COUNTY'].str.zfill(5)
atus['COUNTY_NAME'] = atus['COUNTY'].map(highlighted_regions).fillna('All Others')
atus['IS_NYC'] = atus['COUNTY'].isin(highlighted_regions)
atus = atus.query(f'{var} == 0 or {var} == 1')


metro_labels = {1:'Metropolitan central',
                2: 'Metropolitan noncentral',
                4: 'Rural'}
atus['metro'] = atus['METRO'].map(metro_labels)

msize_labels = {2: 'A: 100,000 - 249,999',
                3: 'B: 250,000 - 499,999',
                4: 'C: 500,000 - 999,999',
                5: 'D: 1,000,000 - 2,499,999',
                6: 'E: 2,500,000 - 4,999,999',
                7: 'F: 5,000,000 +'}

atus['metro_size'] = atus['MSASIZE'].map(msize_labels)


age_lbin = [10, 20, 30, 40, 50, 60, 70]
atus['Age'] = pd.cut(atus.AGE, bins=age_lbin, 
                            labels=[f'{str(lower)} to {str(age_lbin[i+1])}'.replace('60 to 70', '60 and above') 
                                    for i, lower in enumerate(age_lbin[:-1])])


race_lab = {'100': 'White',
            '110': 'Black',
            # '120': 'Other',
            '130': 'Asian',
            '131': 'Asian'}
            # '132': 'Other',
            # '200': 'Other',
            # '201': 'Other',
            # '202': 'Other',
            # '203': 'Other',
            # '210': 'Other',
            # '211': 'Other',
            # '212': 'Other',
            # '220': 'Other',
            # '221': 'Other',
            # '230': 'Other',
            # '300': 'Other',
            # '301': 'Other',
            # '302': 'Other',
            # '310': 'Other',
            # '311': 'Other',
            # '320': 'Other',
            # '330': 'Other'}

atus['Race/Ethnicity'] = atus['RACE'].astype(str).map(race_lab)

# atus.loc[(atus['RACE_G']=="Asian") & (atus['ASIAN'] == 10), 'RACE_G'] = "South Asian"
# atus.loc[(atus['RACE_G']=="Asian"), 'RACE_G'] = "East/Southeast Asian"
atus['HISPANIC'] = atus['HISPAN'].map({100:False}).fillna(True)
atus.loc[(atus['Race/Ethnicity']=="White") & (atus['HISPANIC'] == True), 'Race/Ethnicity'] = "Hispanic"

citizenlabel = {1:'Native citizen',
                2:'Native citizen',
                3:'Native citizen',
                4:'Foreign-born citizen',
                5:'Non-citizen'}

atus['Citizenship'] = atus['CITIZEN'].map(citizenlabel)

age_lab = {1: 'Male',
           2: 'Female'}
atus['Sex'] = atus['SEX'].map(age_lab)

edu_label = {40:"D: Four year college",
             21:"B: High school graduate",
             20:"B: High school graduate",
             30:"C: Two year college",
             31:"C: Two year college",
             32:"C: Two year college",
             41:"E: Postgraduate degree",
             42:"E: Postgraduate degree",
             43:"E: Postgraduate degree"}
for val in range(10, 17):
    edu_label[val] = "A: Less than HS"

atus['Education'] = atus['EDUC'].map(edu_label)


# In[12]:

atus_all = atus.query('~IS_NYC').copy()
atus_nyc = atus.query('IS_NYC').copy()

sort = {'Age':None, 
        'Race/Ethnicity':['Asian', 'Black', 'Hispanic', 'White', 'Other'],
        'Citizenship':['Native citizen', 'Foreign-born citizen', 'Non-citizen'],
        'Sex':None,
        'Education':None}

all_data = []
for var in sort:
    df = split_both(var, sort=sort[var]).reset_index()
    df.insert(0, 'CATEGORY', var)
    all_data.append(df)

all_data = pd.concat(all_data)

all_data.to_csv('../resources/wfh/wfh_percentages.csv', index=False)

comparison('metro', borough=True, save=var.lower())
comparison('metro_size', borough=False, save=var.lower())