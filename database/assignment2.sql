-- Assignment 2: SQL Database Operations
INSERT INTO public.account (
    account_firstname, 
	account_lastname, 
	account_email, 
	account_password
  )
VALUES   (
    'Tony', 
	'Stark', 
	'tony@starkent.com', 
	'Iam1ronM@n'
	);

-- Update the account type for Tony Stark to 'Admin'
    	UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete the account for Tony Stark
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';


-- Update the description of the GM Hummer to replace 'small interiors' with 'a huge interior'
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Select the make, model, and classification name of all vehicles that are classified as 'Sport'
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Update the inv_image and inv_thumbnail paths to include '/vehicles/' in the path
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


