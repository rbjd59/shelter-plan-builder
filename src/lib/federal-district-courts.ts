// Full list of the 94 U.S. federal district courts (clerks of court).
// Source: U.S. Courts (uscourts.gov). The Company does NOT select venue
// for the customer. This list is provided as a reading aid so the
// customer can write the correct district and clerk's address on their
// own packet after detention.
//
// Venue rule (28 U.S.C. § 2241, § 1391; Rumsfeld v. Padilla, 542 U.S.
// 426 (2004)): a habeas petition challenging physical custody is filed
// in the federal judicial district where the petitioner is PHYSICALLY
// CONFINED at the time of filing, naming the immediate custodian
// (typically the warden of the detention facility) as respondent.

export type FederalDistrict = {
  /** Official short name, e.g. "Southern District of Florida". */
  name: string;
  /** Two-letter state/territory code. */
  state: string;
  /** Clerk's principal-office mailing address. */
  clerk_address: string;
};

export const VENUE_INSTRUCTIONS_EN = [
  "A habeas petition under 28 U.S.C. § 2241 must be filed in the federal judicial district where you are physically detained at the time of filing.",
  "Find the city and state of the ICE facility, jail, or processing center where you are being held.",
  "Look up that location in the list below and use the matching U.S. District Court. If unsure, ask facility staff which federal district covers the facility's address.",
  "Address the envelope to 'Clerk of the U.S. District Court' followed by the clerk's address for that district.",
  "Name your immediate custodian (typically the warden of the facility) as the respondent on Form AO 242.",
];

export const VENUE_INSTRUCTIONS_ES = [
  "Una petición de hábeas bajo 28 U.S.C. § 2241 debe presentarse en el distrito judicial federal donde usted esté físicamente detenido al momento de presentarla.",
  "Identifique la ciudad y estado del centro de ICE, cárcel o centro de procesamiento donde lo tienen.",
  "Busque esa ubicación en la lista a continuación y use el Tribunal de Distrito de EE.UU. correspondiente. Si no está seguro, pregunte al personal del centro qué distrito federal cubre la dirección.",
  "Dirija el sobre a 'Clerk of the U.S. District Court' seguido de la dirección del secretario para ese distrito.",
  "Nombre como demandado a su custodio inmediato (generalmente el alcaide del centro) en el Formulario AO 242.",
];

export const VENUE_INSTRUCTIONS_HT = [
  "Yon petisyon habeas dapre 28 U.S.C. § 2241 dwe depoze nan distri jidisyè federal kote ou fizikman detni lè w ap depoze a.",
  "Jwenn vil ak eta sant ICE, prizon, oswa sant pwosesis kote yo kenbe w la.",
  "Chèche kote sa a nan lis ki anba a epi sèvi ak Tribinal Distri Etazini ki kòresponn lan. Si w pa sèten, mande anplwaye sant lan ki distri federal ki kouvri adrès la.",
  "Adrese anvlòp la bay 'Clerk of the U.S. District Court' apre adrès grefye distri sa a.",
  "Nonmen gadyen imedya w (jeneralman direktè sant lan) kòm reponse sou Fòm AO 242.",
];

export const FEDERAL_DISTRICTS: FederalDistrict[] = [
  // Alabama
  { name: "Northern District of Alabama", state: "AL", clerk_address: "Hugo L. Black U.S. Courthouse, 1729 5th Avenue North, Birmingham, AL 35203" },
  { name: "Middle District of Alabama", state: "AL", clerk_address: "Frank M. Johnson Jr. U.S. Courthouse, One Church Street, Montgomery, AL 36104" },
  { name: "Southern District of Alabama", state: "AL", clerk_address: "John Archibald Campbell U.S. Courthouse, 113 St. Joseph Street, Mobile, AL 36602" },
  // Alaska
  { name: "District of Alaska", state: "AK", clerk_address: "Old Federal Building, 222 W. 7th Avenue, #4, Anchorage, AK 99513" },
  // Arizona
  { name: "District of Arizona", state: "AZ", clerk_address: "Sandra Day O'Connor U.S. Courthouse, 401 W. Washington Street, SPC 1, Phoenix, AZ 85003" },
  // Arkansas
  { name: "Eastern District of Arkansas", state: "AR", clerk_address: "Richard Sheppard Arnold U.S. Courthouse, 600 W. Capitol Avenue, Suite A149, Little Rock, AR 72201" },
  { name: "Western District of Arkansas", state: "AR", clerk_address: "John Paul Hammerschmidt Federal Building, 35 E. Mountain Street, Room 510, Fayetteville, AR 72701" },
  // California
  { name: "Northern District of California", state: "CA", clerk_address: "Phillip Burton U.S. Courthouse, 450 Golden Gate Avenue, San Francisco, CA 94102" },
  { name: "Eastern District of California", state: "CA", clerk_address: "Robert T. Matsui U.S. Courthouse, 501 I Street, Sacramento, CA 95814" },
  { name: "Central District of California", state: "CA", clerk_address: "First Street U.S. Courthouse, 350 W. 1st Street, Suite 4311, Los Angeles, CA 90012" },
  { name: "Southern District of California", state: "CA", clerk_address: "Edward J. Schwartz U.S. Courthouse, 221 W. Broadway, Suite 4290, San Diego, CA 92101" },
  // Colorado
  { name: "District of Colorado", state: "CO", clerk_address: "Alfred A. Arraj U.S. Courthouse, 901 19th Street, Denver, CO 80294" },
  // Connecticut
  { name: "District of Connecticut", state: "CT", clerk_address: "Abraham A. Ribicoff Federal Building, 450 Main Street, Hartford, CT 06103" },
  // Delaware
  { name: "District of Delaware", state: "DE", clerk_address: "J. Caleb Boggs Federal Building, 844 N. King Street, Wilmington, DE 19801" },
  // DC
  { name: "District of Columbia", state: "DC", clerk_address: "E. Barrett Prettyman U.S. Courthouse, 333 Constitution Avenue NW, Washington, DC 20001" },
  // Florida
  { name: "Northern District of Florida", state: "FL", clerk_address: "U.S. Courthouse, 111 N. Adams Street, Tallahassee, FL 32301" },
  { name: "Middle District of Florida", state: "FL", clerk_address: "Sam M. Gibbons U.S. Courthouse, 801 N. Florida Avenue, Tampa, FL 33602" },
  { name: "Southern District of Florida", state: "FL", clerk_address: "Wilkie D. Ferguson Jr. U.S. Courthouse, 400 N. Miami Avenue, Miami, FL 33128" },
  // Georgia
  { name: "Northern District of Georgia", state: "GA", clerk_address: "Richard B. Russell Federal Building, 75 Ted Turner Drive SW, Atlanta, GA 30303" },
  { name: "Middle District of Georgia", state: "GA", clerk_address: "William Augustus Bootle Federal Building, 475 Mulberry Street, Macon, GA 31201" },
  { name: "Southern District of Georgia", state: "GA", clerk_address: "Tomochichi U.S. Courthouse, 125 Bull Street, Savannah, GA 31401" },
  // Hawaii
  { name: "District of Hawaii", state: "HI", clerk_address: "Prince Jonah Kuhio Kalanianaole Federal Building, 300 Ala Moana Boulevard, C-338, Honolulu, HI 96850" },
  // Idaho
  { name: "District of Idaho", state: "ID", clerk_address: "James A. McClure Federal Building, 550 W. Fort Street, Boise, ID 83724" },
  // Illinois
  { name: "Northern District of Illinois", state: "IL", clerk_address: "Everett McKinley Dirksen U.S. Courthouse, 219 S. Dearborn Street, 20th Floor, Chicago, IL 60604" },
  { name: "Central District of Illinois", state: "IL", clerk_address: "U.S. Courthouse, 600 E. Monroe Street, Springfield, IL 62701" },
  { name: "Southern District of Illinois", state: "IL", clerk_address: "Melvin Price Federal Courthouse, 750 Missouri Avenue, East St. Louis, IL 62201" },
  // Indiana
  { name: "Northern District of Indiana", state: "IN", clerk_address: "E. Ross Adair Federal Building, 1300 S. Harrison Street, Fort Wayne, IN 46802" },
  { name: "Southern District of Indiana", state: "IN", clerk_address: "Birch Bayh Federal Building, 46 E. Ohio Street, Indianapolis, IN 46204" },
  // Iowa
  { name: "Northern District of Iowa", state: "IA", clerk_address: "U.S. Courthouse, 111 7th Avenue SE, Box 12, Cedar Rapids, IA 52401" },
  { name: "Southern District of Iowa", state: "IA", clerk_address: "U.S. Courthouse, 123 E. Walnut Street, Des Moines, IA 50309" },
  // Kansas
  { name: "District of Kansas", state: "KS", clerk_address: "Robert J. Dole U.S. Courthouse, 500 State Avenue, Kansas City, KS 66101" },
  // Kentucky
  { name: "Eastern District of Kentucky", state: "KY", clerk_address: "John C. Hinckley Federal Building, 101 Barr Street, Lexington, KY 40507" },
  { name: "Western District of Kentucky", state: "KY", clerk_address: "Gene Snyder U.S. Courthouse, 601 W. Broadway, Louisville, KY 40202" },
  // Louisiana
  { name: "Eastern District of Louisiana", state: "LA", clerk_address: "Hale Boggs Federal Building, 500 Poydras Street, Room C-151, New Orleans, LA 70130" },
  { name: "Middle District of Louisiana", state: "LA", clerk_address: "Russell B. Long Federal Building, 777 Florida Street, Suite 139, Baton Rouge, LA 70801" },
  { name: "Western District of Louisiana", state: "LA", clerk_address: "Tom Stagg U.S. Courthouse, 300 Fannin Street, Shreveport, LA 71101" },
  // Maine
  { name: "District of Maine", state: "ME", clerk_address: "Edward T. Gignoux U.S. Courthouse, 156 Federal Street, Portland, ME 04101" },
  // Maryland
  { name: "District of Maryland", state: "MD", clerk_address: "Edward A. Garmatz U.S. Courthouse, 101 W. Lombard Street, Baltimore, MD 21201" },
  // Massachusetts
  { name: "District of Massachusetts", state: "MA", clerk_address: "John Joseph Moakley U.S. Courthouse, 1 Courthouse Way, Suite 2300, Boston, MA 02210" },
  // Michigan
  { name: "Eastern District of Michigan", state: "MI", clerk_address: "Theodore Levin U.S. Courthouse, 231 W. Lafayette Boulevard, Detroit, MI 48226" },
  { name: "Western District of Michigan", state: "MI", clerk_address: "Gerald R. Ford Federal Building, 110 Michigan Street NW, Grand Rapids, MI 49503" },
  // Minnesota
  { name: "District of Minnesota", state: "MN", clerk_address: "Warren E. Burger Federal Building, 316 N. Robert Street, Suite 100, St. Paul, MN 55101" },
  // Mississippi
  { name: "Northern District of Mississippi", state: "MS", clerk_address: "Thomas G. Abernethy Federal Building, 301 W. Commerce Street, Aberdeen, MS 39730" },
  { name: "Southern District of Mississippi", state: "MS", clerk_address: "Thad Cochran U.S. Courthouse, 501 E. Court Street, Suite 2.500, Jackson, MS 39201" },
  // Missouri
  { name: "Eastern District of Missouri", state: "MO", clerk_address: "Thomas F. Eagleton U.S. Courthouse, 111 S. 10th Street, St. Louis, MO 63102" },
  { name: "Western District of Missouri", state: "MO", clerk_address: "Charles Evans Whittaker U.S. Courthouse, 400 E. 9th Street, Kansas City, MO 64106" },
  // Montana
  { name: "District of Montana", state: "MT", clerk_address: "James F. Battin U.S. Courthouse, 2601 2nd Avenue North, Billings, MT 59101" },
  // Nebraska
  { name: "District of Nebraska", state: "NE", clerk_address: "Roman L. Hruska U.S. Courthouse, 111 S. 18th Plaza, Suite 1152, Omaha, NE 68102" },
  // Nevada
  { name: "District of Nevada", state: "NV", clerk_address: "Lloyd D. George U.S. Courthouse, 333 Las Vegas Boulevard South, Las Vegas, NV 89101" },
  // New Hampshire
  { name: "District of New Hampshire", state: "NH", clerk_address: "Warren B. Rudman U.S. Courthouse, 55 Pleasant Street, Concord, NH 03301" },
  // New Jersey
  { name: "District of New Jersey", state: "NJ", clerk_address: "Frank R. Lautenberg U.S. Post Office and Courthouse, 1 Federal Square, Newark, NJ 07102" },
  // New Mexico
  { name: "District of New Mexico", state: "NM", clerk_address: "Pete V. Domenici U.S. Courthouse, 333 Lomas Boulevard NW, Suite 270, Albuquerque, NM 87102" },
  // New York
  { name: "Northern District of New York", state: "NY", clerk_address: "James T. Foley U.S. Courthouse, 445 Broadway, Albany, NY 12207" },
  { name: "Southern District of New York", state: "NY", clerk_address: "Daniel Patrick Moynihan U.S. Courthouse, 500 Pearl Street, New York, NY 10007" },
  { name: "Eastern District of New York", state: "NY", clerk_address: "Theodore Roosevelt U.S. Courthouse, 225 Cadman Plaza East, Brooklyn, NY 11201" },
  { name: "Western District of New York", state: "NY", clerk_address: "Robert H. Jackson U.S. Courthouse, 2 Niagara Square, Buffalo, NY 14202" },
  // North Carolina
  { name: "Eastern District of North Carolina", state: "NC", clerk_address: "Terry Sanford Federal Building, 310 New Bern Avenue, Raleigh, NC 27601" },
  { name: "Middle District of North Carolina", state: "NC", clerk_address: "L. Richardson Preyer Federal Building, 324 W. Market Street, Greensboro, NC 27401" },
  { name: "Western District of North Carolina", state: "NC", clerk_address: "Charles R. Jonas Federal Building, 401 W. Trade Street, Charlotte, NC 28202" },
  // North Dakota
  { name: "District of North Dakota", state: "ND", clerk_address: "Quentin N. Burdick U.S. Courthouse, 655 1st Avenue North, Suite 130, Fargo, ND 58102" },
  // Ohio
  { name: "Northern District of Ohio", state: "OH", clerk_address: "Carl B. Stokes U.S. Courthouse, 801 W. Superior Avenue, Cleveland, OH 44113" },
  { name: "Southern District of Ohio", state: "OH", clerk_address: "Joseph P. Kinneary U.S. Courthouse, 85 Marconi Boulevard, Columbus, OH 43215" },
  // Oklahoma
  { name: "Northern District of Oklahoma", state: "OK", clerk_address: "Page Belcher Federal Building, 333 W. 4th Street, Tulsa, OK 74103" },
  { name: "Eastern District of Oklahoma", state: "OK", clerk_address: "Ed Edmondson U.S. Courthouse, 101 N. 5th Street, Muskogee, OK 74401" },
  { name: "Western District of Oklahoma", state: "OK", clerk_address: "U.S. Courthouse, 200 NW 4th Street, Oklahoma City, OK 73102" },
  // Oregon
  { name: "District of Oregon", state: "OR", clerk_address: "Mark O. Hatfield U.S. Courthouse, 1000 SW 3rd Avenue, Portland, OR 97204" },
  // Pennsylvania
  { name: "Eastern District of Pennsylvania", state: "PA", clerk_address: "James A. Byrne U.S. Courthouse, 601 Market Street, Philadelphia, PA 19106" },
  { name: "Middle District of Pennsylvania", state: "PA", clerk_address: "Ronald Reagan Federal Building, 228 Walnut Street, Harrisburg, PA 17101" },
  { name: "Western District of Pennsylvania", state: "PA", clerk_address: "Joseph F. Weis Jr. U.S. Courthouse, 700 Grant Street, Pittsburgh, PA 15219" },
  // Rhode Island
  { name: "District of Rhode Island", state: "RI", clerk_address: "Federal Building and U.S. Courthouse, 1 Exchange Terrace, Providence, RI 02903" },
  // South Carolina
  { name: "District of South Carolina", state: "SC", clerk_address: "Matthew J. Perry Jr. U.S. Courthouse, 901 Richland Street, Columbia, SC 29201" },
  // South Dakota
  { name: "District of South Dakota", state: "SD", clerk_address: "U.S. Courthouse, 400 S. Phillips Avenue, Room 128, Sioux Falls, SD 57104" },
  // Tennessee
  { name: "Eastern District of Tennessee", state: "TN", clerk_address: "Howard H. Baker Jr. U.S. Courthouse, 800 Market Street, Suite 130, Knoxville, TN 37902" },
  { name: "Middle District of Tennessee", state: "TN", clerk_address: "Estes Kefauver Federal Building, 801 Broadway, Nashville, TN 37203" },
  { name: "Western District of Tennessee", state: "TN", clerk_address: "Clifford Davis / Odell Horton Federal Building, 167 N. Main Street, Memphis, TN 38103" },
  // Texas
  { name: "Northern District of Texas", state: "TX", clerk_address: "Earle Cabell Federal Building, 1100 Commerce Street, Room 1452, Dallas, TX 75242" },
  { name: "Southern District of Texas", state: "TX", clerk_address: "Bob Casey U.S. Courthouse, 515 Rusk Street, Houston, TX 77002" },
  { name: "Eastern District of Texas", state: "TX", clerk_address: "Paul Brown U.S. Courthouse, 101 E. Pecan Street, Sherman, TX 75090" },
  { name: "Western District of Texas", state: "TX", clerk_address: "John H. Wood Jr. U.S. Courthouse, 655 E. Cesar E. Chavez Boulevard, San Antonio, TX 78206" },
  // Utah
  { name: "District of Utah", state: "UT", clerk_address: "Orrin G. Hatch U.S. Courthouse, 351 S. West Temple, Salt Lake City, UT 84101" },
  // Vermont
  { name: "District of Vermont", state: "VT", clerk_address: "Federal Building, 11 Elmwood Avenue, Burlington, VT 05401" },
  // Virginia
  { name: "Eastern District of Virginia", state: "VA", clerk_address: "Albert V. Bryan U.S. Courthouse, 401 Courthouse Square, Alexandria, VA 22314" },
  { name: "Western District of Virginia", state: "VA", clerk_address: "U.S. Courthouse, 210 Franklin Road SW, Roanoke, VA 24011" },
  // Washington
  { name: "Eastern District of Washington", state: "WA", clerk_address: "William O. Douglas Federal Building, 25 S. 3rd Street, Yakima, WA 98901" },
  { name: "Western District of Washington", state: "WA", clerk_address: "U.S. Courthouse, 700 Stewart Street, Suite 2310, Seattle, WA 98101" },
  // West Virginia
  { name: "Northern District of West Virginia", state: "WV", clerk_address: "U.S. Courthouse, 500 W. Pike Street, Clarksburg, WV 26301" },
  { name: "Southern District of West Virginia", state: "WV", clerk_address: "Robert C. Byrd U.S. Courthouse, 300 Virginia Street East, Charleston, WV 25301" },
  // Wisconsin
  { name: "Eastern District of Wisconsin", state: "WI", clerk_address: "U.S. Courthouse, 517 E. Wisconsin Avenue, Milwaukee, WI 53202" },
  { name: "Western District of Wisconsin", state: "WI", clerk_address: "U.S. Courthouse, 120 N. Henry Street, Madison, WI 53703" },
  // Wyoming
  { name: "District of Wyoming", state: "WY", clerk_address: "Joseph C. O'Mahoney Federal Center, 2120 Capitol Avenue, Cheyenne, WY 82001" },
  // Territories
  { name: "District of Puerto Rico", state: "PR", clerk_address: "Federico Degetau Federal Building, 150 Carlos Chardon Avenue, San Juan, PR 00918" },
  { name: "District of the Virgin Islands", state: "VI", clerk_address: "Ron de Lugo Federal Building, 5500 Veterans Drive, Suite 310, St. Thomas, VI 00802" },
  { name: "District of Guam", state: "GU", clerk_address: "U.S. Courthouse, 520 W. Soledad Avenue, 4th Floor, Hagåtña, GU 96910" },
  { name: "District of the Northern Mariana Islands", state: "MP", clerk_address: "U.S. Courthouse, Horiguchi Building, 2nd Floor, Beach Road, Saipan, MP 96950" },
];
